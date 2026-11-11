/* Core e riabilitativi avanzati */
"use strict";
const { SIT, FSIT, VB, R, o, STAND, FSTAND, SUP, HOOK, PRONE, QUAD, M } = require("./libreria");
const H = require("./mani");
const COL = require("./pose-colonna");
const SUPER = require("./pose-arto-superiore");
const { C, f1, seg } = M;

const T = (x, y, t, s) => ({ type: "text", x, y, text: t, size: s || 10 });
const copyFrom = (list, from, id) => Object.assign({}, list.find((d) => d.id === from), { id });

// posture frontali ricorrenti (a = arto a sinistra dello schermo)
const FSPLIT_UP = { la: { ik: [-4, 82] }, lb: { K: [6, 40], A: [8, 78], pf: 40 } };
const FSPLIT_DOWN = { la: { K: [-6, 20], A: [-6, 58] }, lb: { K: [6, 40], A: [6, 46], ftL: 0.3 } };
const PALLOF_IN = { aa: { E: [-4, 24], Wr: [14, 14] }, ab: { E: [4, 24], Wr: [-14, 14] } };
const PALLOF_OUT = { aa: { E: [8, 12], Wr: [16, 18] }, ab: { E: [-8, 12], Wr: [-16, 18] } };
const cableL = { type: "cable", x: 26, y: "wrista", to: "wrista" };
const pushOut = { type: "arrow", from: ["wrista", 30, -4], to: ["wrista", 30, 10] };
const valgo = (side) => (J) => [{ type: "post", x: J.pelvis[0] + 90 * side, y: J.kneea[1] - 20 }, { type: "band", from: [J.pelvis[0] + 90 * side, J.kneea[1]], to: ["kneea", side * 5, 0] }];
// Pallof visto di lato: le braccia spingono in avanti (ben leggibile); il cavo arriva di lato, quindi la colonna del cavo è disegnata dietro alla figura
const SP_IN = { aa: { ua: 18, fa: 148 }, ab: { ua: 22, fa: 146 } };
const SP_OUT = { aa: { ua: 88, fa: 90 }, ab: { ua: 84, fa: 88 } };
const SPLIT_S_UP = { la: { ik: [22, 80] }, lb: { ik: [-26, 76], pf: 35 } };
const SPLIT_S_DOWN = { la: { ik: [36, 46] }, lb: { th: -22, sh: -92, pf: 30 } };
const sideCable = (out) => (J) => {
  const h = out ? J.wrista : J.wrista;
  const r = [{ type: "raw", svg: `<circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="3.2" fill="${C.eq}"/>` },
    { type: "text", x: J.shoulder[0], y: J.headTop[1] - 8, text: "maniglia del cavo, cavo di lato: il tronco non ruota", size: 9 }];
  if (out) r.push({ type: "arrow", from: ["shoulder", 14, 6], to: ["wrista", -6, 0] });
  return r;
};
const KB_RACK = { type: "kb", at: ["handa", 4, -2] };

// diagrammi visti dall'alto
function diagram(inner, caption) { return H.bg() + `<rect x="20" y="16" width="260" height="154" rx="8" fill="#D9E6E3"/>` + inner + H.label(150, 190, caption, 11); }
function dot(x, y, t, col) { return `<circle cx="${x}" cy="${y}" r="11" fill="${col || C.hl}"/><text x="${x}" y="${y + 4}" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">${t}</text>`; }
function person(x, y) { return `<circle cx="${x}" cy="${y}" r="9" fill="${C.near}"/><rect x="${x - 14}" y="${y - 5}" width="28" height="10" rx="5" fill="${C.near}" opacity="0.8"/>`; }
const dash = (a, b, bend) => M.arrowPath(a, b, bend).replace('stroke-width="2.6"', 'stroke-width="2.4" stroke-dasharray="5 4"');

module.exports = [
  /* ---------- CORE ---------- */
  { id: "core-rollout-fitball", anchor: "kneea", frames: [
    { pose: { t: 128, la: { th: 6, sh: -92, ft: -95 }, aa: { ua: 70, fa: 92 }, ab: { ua: 70, fa: 92 }, groundOn: ["kneea"] }, props: [{ type: "ball", at: ["wrista", -6, 24], r: 22, layer: "back" }] },
    { pose: { t: 102, la: { th: -70, sh: -92, ft: -95 }, aa: { ua: 92, fa: 92 }, ab: { ua: 92, fa: 92 }, hl: ["aa"] }, props: [{ type: "ball", at: ["wrista", -6, 24], r: 22, layer: "back" }] }] },

  { id: "core-body-saw", anchor: "elbowa", frames: [
    { pose: { t: 96, la: { th: -84, sh: -84 }, aa: { ua: 0, fa: 92 }, ab: { ua: 0, fa: 92 }, groundOn: ["elbowa"] }, props: [{ type: "slider", under: "toea" }] },
    { pose: { t: 96, la: { th: -84, sh: -84 }, aa: { ua: 36, fa: 92 }, ab: { ua: 36, fa: 92 }, hl: ["aa"] }, props: [{ type: "slider", under: "toea" }, { type: "arrow", from: ["pelvis", 10, -22], to: ["pelvis", -14, -22] }] }] },

  { id: "core-stir-the-pot", frames: [
    { pose: { t: 106, la: { th: -74, sh: -74 }, aa: { ua: 6, fa: 92 }, ab: { ua: 6, fa: 92 }, groundOn: ["toea"], ignoreGround: [6, 7, 8, 9] }, props: (J) => [{ type: "ballFloor", x: J.elbowa[0] + 10, r: (186 - J.elbowa[1] - 5) / 2 }, { type: "arc", at: ["elbowa", 10, 0], r: 16, ry: 7, a0: 200, a1: 520 / 1.5 }] }] },

  { id: "core-side-plank-ginocchia", anchor: "shoulder", move: [{ j: "pelvis", bend: 6 }], frames: [
    { pose: { view: "front", t: 238, la: { th: 46, sh: 40, shL: 0.35 }, lb: { th: 50, sh: 44, shL: 0.35 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [14, 6], Wr: [24, 18] }, groundOn: ["elbowa"] } },
    { pose: { view: "front", t: 254, la: { th: 72, sh: 60, shL: 0.35 }, lb: { th: 76, sh: 64, shL: 0.35 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [14, 6], Wr: [24, 18] }, hl: ["la"] } }] },

  { id: "core-side-plank-abduzione", anchor: "shoulder", move: [{ j: "ankleb", bend: 6 }], frames: [
    { pose: { view: "front", t: 252, la: { th: 72, sh: 72, ft: 162 }, lb: { th: 74, sh: 74, ft: 164 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [14, 6], Wr: [24, 18] }, groundOn: ["elbowa"] } },
    { pose: { view: "front", t: 252, la: { th: 72, sh: 72, ft: 162 }, lb: { th: 104, sh: 104, ft: 194 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [14, 6], Wr: [24, 18] }, hl: ["lb"] } }] },

  { id: "core-side-plank-rematore", anchor: "shoulder", frames: [
    { pose: { view: "front", t: 254, la: { th: 72, sh: 60, shL: 0.35 }, lb: { th: 76, sh: 64, shL: 0.35 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [6, 14], Wr: [10, 30], uaL: 0.6 }, groundOn: ["elbowa"] }, props: [{ type: "line", from: "wristb", to: ["wristb", 40, 10], col: C.eq, w: 1.8 }, T(250, 40, "cavo davanti")] },
    { pose: { view: "front", t: 254, la: { th: 72, sh: 60, shL: 0.35 }, lb: { th: 76, sh: 64, shL: 0.35 }, aa: { E: [-2, 26], Wr: [-24, 30] }, ab: { E: [-4, -22], Wr: [6, -6] }, hl: ["ab"] }, props: [{ type: "line", from: "wristb", to: ["wristb", 40, 26], col: C.eq, w: 1.8 }, T(250, 40, "cavo davanti")] }] },

  { id: "core-suitcase-march", anchor: "anklea", frames: [
    { pose: o(FSTAND, { ab: { ua: 4, fa: 2 } }), props: [{ type: "kb", at: "handb" }] },
    { pose: o(FSTAND, { lb: { K: [4, 8], A: [6, 46] }, ab: { ua: 4, fa: 2 }, hl: ["lb"] }), props: [{ type: "kb", at: "handb" }] }] },

  { id: "core-rack-carry", frames: [
    { pose: { t: 180, la: { ik: [22, 80] }, lb: { ik: [-20, 80], pf: 25 }, aa: { ua: 14, fa: 160 }, ab: { ua: 12, fa: 158 } }, props: [KB_RACK] }] },

  { id: "core-cavo-anti-flessione-laterale", anchor: "anklea", frames: [
    { pose: o(FSTAND, { ab: { E: [-4, 26], Wr: [-18, 40] } }), props: [{ type: "cable", x: 24, y: 160, to: "wristb" }] },
    { pose: o(FSTAND, { lb: { ik: [26, 80] }, ab: { E: [-4, 26], Wr: [-18, 40] } }), props: [{ type: "cable", x: 24, y: 160, to: "wristb" }, { type: "arrow", from: ["ankleb", 0, -30], to: ["ankleb", 24, -30] }] }] },

  { id: "core-bear-crawl", anchor: "wristb", frames: [
    { pose: o(QUAD, { la: { th: 2, sh: -98, ft: 25 }, lb: { th: 2, sh: -98, ft: 25 }, groundOn: ["toea"] }) },
    { pose: o(QUAD, { la: { th: 2, sh: -98, ft: 25 }, lb: { th: 26, sh: -80, ft: 25 }, aa: { ua: 26, fa: 20, hd: 90 }, ab: { ua: 0, fa: 0, hd: 90 }, hl: ["aa", "lb"] }) }] },

  { id: "core-panca-manubrio-mono", anchor: "pelvis", frames: [
    { pose: { t: 270, la: { th: 96, sh: 2 }, lb: { th: 94, sh: 0 }, aa: { ua: 180, fa: 110 }, ab: { ua: 88, fa: 88 }, groundOn: ["heela"] }, props: (J) => [{ type: "bench", x: J.headTop[0] - 4, w: J.pelvis[0] - J.headTop[0] + 20, top: J.pelvis[1] + 11 }, { type: "db", at: "handa" }] },
    { pose: { t: 270, la: { th: 96, sh: 2 }, lb: { th: 94, sh: 0 }, aa: { ua: 180, fa: 180 }, ab: { ua: 88, fa: 88 }, hl: ["aa"] }, props: (J) => [{ type: "bench", x: J.headTop[0] - 4, w: J.pelvis[0] - J.headTop[0] + 20, top: J.pelvis[1] + 11 }, { type: "db", at: "handa" }] }] },

  copyFrom(COL, "tor-respirazione-costale", "core-respirazione-90-90"),

  { id: "core-attivazione-trasverso", frames: [
    { pose: o(HOOK, { aa: { ua: 70, fa: 120 } }), props: [{ type: "cuff", at: ["pelvis", -14, 10] }, { type: "arrow", from: ["mid", 6, -26], to: ["mid", 6, -14] }, T(150, 30, "ombelico verso la colonna")] }] },

  { id: "core-bracing", frames: [
    { pose: o(STAND, { aa: { ik: R(180, [10, 40]) }, ab: { ik: R(180, [10, 40]) } }), props: [{ type: "arrow", from: ["mid", 30, 0], to: ["mid", 14, 0] }, { type: "arrow", from: ["mid", -30, 0], to: ["mid", -14, 0] }, T(230, 40, "addome 'a corsetto'")] }] },

  { id: "core-heel-slide", anchor: "pelvis", move: [{ j: "anklea", bend: 0, off: [0, 8] }], frames: [
    { pose: o(HOOK, { groundOn: ["pelvis"] }) },
    { pose: o(HOOK, { la: { th: 90, sh: 90 }, hl: ["la"] }) }] },

  { id: "core-mb-lancio-rotazionale", anchor: "anklea", frames: [
    { pose: o(FSTAND, { shW: 10, hr: -0.6, la: { ik: [-18, 80] }, lb: { ik: [18, 80] }, aa: { E: [-6, 26], Wr: [-18, 44] }, ab: { E: [-14, 26], Wr: [-40, 40] } }), props: [{ type: "medball", at: ["wrista", -10, 0], r: 9 }, { type: "wall", x: 270, w: 10 }] },
    { pose: o(FSTAND, { shW: 12, hr: 0.6, la: { ik: [-18, 80], pf: 40 }, lb: { ik: [18, 80] }, aa: { ua: 70, fa: 70 }, ab: { ua: 80, fa: 80 }, hl: ["aa", "ab"] }), props: [{ type: "medball", at: [250, 100], r: 9 }, { type: "wall", x: 270, w: 10 }, { type: "arrow", from: [200, 100], to: [238, 100] }] }] },

  { id: "core-mb-lancio-mezzo-ginocchio", anchor: "pelvis", frames: [
    { pose: { view: "front", t: 180, shW: 10, hr: -0.6, la: { K: [-4, 43], A: [-4, 46], ft: 0, ftL: 0.3 }, lb: { K: [8, 6], A: [10, 46] }, aa: { E: [-6, 26], Wr: [-18, 44] }, ab: { E: [-14, 26], Wr: [-40, 40] }, groundOn: ["kneea"] }, props: [{ type: "medball", at: ["wrista", -10, 0], r: 9 }, { type: "wall", x: 270, w: 10 }] },
    { pose: { view: "front", t: 180, shW: 12, hr: 0.6, la: { K: [-4, 43], A: [-4, 46], ft: 0, ftL: 0.3 }, lb: { K: [8, 6], A: [10, 46] }, aa: { ua: 70, fa: 70 }, ab: { ua: 80, fa: 80 }, hl: ["aa", "ab"] }, props: [{ type: "medball", at: [250, 110], r: 9 }, { type: "wall", x: 270, w: 10 }, { type: "arrow", from: [200, 110], to: [238, 110] }] }] },

  { id: "core-mb-lancio-mono-appoggio", anchor: "anklea", frames: [
    { pose: o(FSTAND, { shW: 10, hr: -0.6, la: { ik: [-2, 80] }, lb: { K: [6, 30], A: [8, 54] }, aa: { E: [-6, 26], Wr: [-18, 44] }, ab: { E: [-14, 26], Wr: [-40, 40] }, hl: ["la"] }), props: [{ type: "medball", at: ["wrista", -10, 0], r: 9 }, { type: "wall", x: 270, w: 10 }] },
    { pose: o(FSTAND, { shW: 12, hr: 0.6, la: { ik: [-2, 80] }, lb: { K: [6, 30], A: [8, 54] }, aa: { ua: 70, fa: 70 }, ab: { ua: 80, fa: 80 }, hl: ["la"] }), props: [{ type: "medball", at: [250, 100], r: 9 }, { type: "wall", x: 270, w: 10 }, { type: "arrow", from: [200, 100], to: [238, 100] }] }] },

  { id: "core-cavo-rotazione-esplosiva", anchor: "anklea", frames: [
    { pose: o(FSTAND, { shW: 9, hr: -0.7, la: { ik: [-14, 82] }, lb: { ik: [14, 82] }, aa: { ua: -86, fa: -86 }, ab: { ua: -84, fa: -84 } }), props: [{ type: "cable", x: 26, y: "wrista", to: "wristb" }] },
    { pose: o(FSTAND, { shW: 9, hr: 0.7, la: { ik: [-14, 82] }, lb: { ik: [14, 82] }, aa: { ua: 86, fa: 86 }, ab: { ua: 88, fa: 88 }, hl: ["aa", "ab"] }), props: [{ type: "cable", x: 26, y: "wrista", to: "wrista" }, { type: "arc", at: "shoulder", r: 30, a0: 200, a1: 340 }] }] },

  { id: "core-salto-lancio-mb", ghost: false, vb: VB, frames: [
    { pose: { dx: -30, lift: 30, t: 192, la: { th: 10, sh: -20, pf: 40 }, lb: { th: 0, sh: -30, pf: 40 }, aa: { ua: 200, fa: 230 }, ab: { ua: 200, fa: 230 } }, props: [{ type: "medball", at: ["handa", -2, -4], r: 9 }] },
    { pose: { shift: 70, lift: 20, t: 160, la: { th: 30, sh: 0, pf: 40 }, lb: { th: 20, sh: -10, pf: 40 }, aa: { ua: 90, fa: 80 }, ab: { ua: 90, fa: 80 }, hl: ["aa"] }, props: [{ type: "medball", at: ["handa", 40, 30], r: 9 }, { type: "arrow", from: ["handa", 12, 6], to: ["handa", 34, 22] }] }] },

  { id: "core-arco-elastico-attacco", anchor: "anklea", vb: [-20, -40, 340, 227], frames: [
    { pose: { t: 196, tc: -14, la: { ik: [-24, 80], pf: 30 }, lb: { ik: [22, 80] }, aa: { ua: 200, fa: 200 }, ab: { ua: 196, fa: 196 } }, props: [{ type: "post", x: "pelvis", dx: -100, y: -40 }, { type: "band", from: ["pelvis", -100, -150], to: "handa" }] },
    { pose: { t: 172, la: { ik: [-24, 80], pf: 30 }, lb: { ik: [22, 80] }, aa: { ua: 150, fa: 150 }, ab: { ua: 146, fa: 146 }, hl: ["trunk"] }, props: [{ type: "post", x: "pelvis", dx: -100, y: -40 }, { type: "band", from: ["pelvis", -100, -150], to: "handa" }, T(240, 30, "controllo dell'arco")] }] },

  { id: "core-pallof-ricezione", anchor: "anklea", frames: [
    { pose: o(STAND, { t: 176, la: { ik: [16, 76] }, lb: { ik: [-12, 76] } }, SP_OUT), props: sideCable(false) },
    { pose: o(STAND, { t: 176, la: { ik: [16, 76] }, lb: { ik: [-12, 76] } }, SP_OUT), props: (J) => sideCable(false)(J).concat([{ type: "arrow", from: ["wrista", 26, -26], to: ["wrista", 8, -10] }, { type: "text", x: J.wrista[0] + 34, y: J.wrista[1] - 30, text: "spinte del terapista", size: 9 }]) }] },

  /* ---------- RIABILITATIVI ---------- */
  { id: "riab-split-squat-rnt-valgo", anchor: "anklea", frames: [
    { pose: o(FSTAND, FSPLIT_UP, { aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }), props: valgo(1) },
    { pose: o(FSTAND, FSPLIT_DOWN, { aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }), props: (J) => valgo(1)(J).concat([{ type: "arrow", from: ["kneea", 4, -14], to: ["kneea", -12, -14] }]) }] },

  { id: "riab-split-squat-rnt-varo", anchor: "anklea", frames: [
    { pose: o(FSTAND, FSPLIT_UP, { aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }), props: valgo(-1) },
    { pose: o(FSTAND, FSPLIT_DOWN, { aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }), props: (J) => valgo(-1)(J).concat([{ type: "arrow", from: ["kneea", -6, -14], to: ["kneea", 10, -14] }]) }] },

  { id: "riab-split-squat-rnt-flessione", anchor: "anklea", frames: [
    { pose: { t: 180, la: { ik: [10, 82] }, lb: { ik: [-34, 76], pf: 45 }, aa: { ua: 4, fa: 6 }, ab: { ua: 4, fa: 6 }, hl: ["la"] }, props: [{ type: "post", x: "anklea", dx: 80, y: 100 }, { type: "band", from: ["anklea", 80, -40], to: ["kneea", -6, 0] }] },
    { pose: { t: 178, la: { ik: [36, 46] }, lb: { th: -22, sh: -92, pf: 30 }, aa: { ua: 4, fa: 6 }, ab: { ua: 4, fa: 6 }, hl: ["la"] }, props: [{ type: "post", x: "anklea", dx: 80, y: 100 }, { type: "band", from: ["anklea", 80, -40], to: ["kneea", -6, 0] }] }] },

  { id: "riab-affondo-avanti-rnt", anchor: "ankleb", frames: [
    { pose: o(FSTAND, { la: { ik: [-4, 82] }, lb: { ik: [4, 82] }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }), props: valgo(1) },
    { pose: o(FSTAND, FSPLIT_DOWN, { la: { K: [-8, 22], A: [-8, 62] }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }), props: valgo(1) }] },

  { id: "riab-step-down-rnt", anchor: "anklea", frames: [
    { pose: o(FSTAND, { la: { th: 0, sh: 0 }, lb: { K: [4, 22], A: [6, 60] }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, groundOn: ["heela"], lift: 22, hl: ["la"] }), props: (J) => [{ type: "box", x: J.anklea[0] - 22, w: 36, top: J.heela[1] + 2 }].concat(valgo(1)(J)) },
    { pose: o(FSTAND, { la: { K: [4, 26], A: [0, 60] }, lb: { K: [4, 20], A: [6, 62] }, aa: { E: [-14, 16], Wr: [-2, 30] }, ab: { E: [14, 16], Wr: [2, 30] }, hl: ["la"] }), props: (J) => [{ type: "box", x: J.anklea[0] - 22, w: 36, top: J.heela[1] + 2 }].concat(valgo(1)(J)) }] },

  { id: "riab-squat-mono-rnt", anchor: "anklea", frames: [
    { pose: o(FSTAND, { la: { th: 0, sh: 0 }, lb: { K: [6, 30], A: [8, 52] }, aa: { E: [2, 22], Wr: [16, 10] }, ab: { E: [-2, 22], Wr: [-16, 10] }, hl: ["la"] }), props: (J) => [{ type: "box", x: J.pelvis[0] - 20, w: 40, top: 150 }].concat(valgo(1)(J)) },
    { pose: o(FSTAND, { la: { K: [-2, 18], A: [0, 44] }, lb: { K: [6, 16], A: [8, 40] }, aa: { E: [2, 22], Wr: [16, 10] }, ab: { E: [-2, 22], Wr: [-16, 10] }, hl: ["la"] }), props: (J) => [{ type: "box", x: J.pelvis[0] - 20, w: 40, top: 150 }].concat(valgo(1)(J)) }] },

  { id: "riab-rdl-mono-rnt", anchor: "anklea", frames: [
    { pose: { t: 180, la: {}, lb: { th: -6, sh: -10 }, aa: { ua: 0, fa: 0 }, ab: { ua: 0, fa: 0 }, hl: ["la"] }, props: [{ type: "post", x: "kneea", dx: -60, y: 120, layer: "back" }, { type: "band", from: ["kneea", -60, 0], to: ["kneea", 0, -10], layer: "back" }, { type: "kb", at: "handa" }] },
    { pose: { t: 96, la: { ik: [16, 82] }, lb: { th: -84, sh: -84, ft: 0 }, aa: { ua: 0, fa: 0 }, ab: { ua: 0, fa: 0 }, hl: ["la"] }, props: [{ type: "post", x: "kneea", dx: -60, y: 120, layer: "back" }, { type: "band", from: ["kneea", -60, 0], to: ["kneea", 0, -10], layer: "back" }, { type: "kb", at: "handa" }] }] },

  { id: "riab-atterraggio-rnt", anchor: "anklea", frames: [
    { pose: o(FSTAND, { lift: 26, la: { th: 0, sh: 0, pf: 30 }, lb: { K: [6, 30], A: [8, 52] }, aa: { E: [-16, 16], Wr: [-28, 4] }, ab: { E: [16, 16], Wr: [28, 4] } }), props: valgo(1) },
    { pose: o(FSTAND, { la: { K: [-2, 24], A: [0, 60] }, lb: { K: [6, 24], A: [8, 44] }, aa: { E: [-16, 16], Wr: [-28, 4] }, ab: { E: [16, 16], Wr: [28, 4] }, hl: ["la"] }), props: valgo(1) }] },

  { id: "riab-affondo-laterale-elastico", anchor: "ankleb", frames: [
    { pose: o(FSTAND, { la: { ik: [-6, 82] }, lb: { ik: [6, 82] }, aa: { E: [2, 22], Wr: [16, 10] }, ab: { E: [-2, 22], Wr: [-16, 10] } }), props: [{ type: "post", x: 280, y: 100 }, { type: "band", from: [280, 110], to: ["pelvis", 12, 0] }] },
    { pose: o(FSTAND, { la: { ik: [-62, 58] }, lb: { K: [14, 22], A: [16, 52] }, aa: { E: [2, 22], Wr: [16, 10] }, ab: { E: [-2, 22], Wr: [-16, 10] }, hl: ["lb"] }), props: [{ type: "post", x: 280, y: 100 }, { type: "band", from: [280, 110], to: ["pelvis", 12, 0] }] }] },

  { id: "riab-split-squat-pallof", anchor: "anklea", frames: [
    { pose: o(STAND, SPLIT_S_DOWN, SP_IN, { hl: ["la"] }), props: sideCable(false) },
    { pose: o(STAND, SPLIT_S_DOWN, SP_OUT, { hl: ["la"] }), props: sideCable(true) }] },

  { id: "riab-affondo-pallof", anchor: "anklea", frames: [
    { pose: o(STAND, { la: { ik: [4, 82] }, lb: { ik: [-4, 82] } }, SP_OUT), props: sideCable(false) },
    { pose: o(STAND, SPLIT_S_DOWN, SP_OUT, { hl: ["la", "lb"] }), props: sideCable(false) }] },

  { id: "riab-pallof-mono", anchor: "anklea", frames: [
    { pose: o(STAND, { la: { ik: [2, 82] }, lb: { th: 70, sh: 0 } }, SP_IN, { hl: ["la"] }), props: sideCable(false) },
    { pose: o(STAND, { la: { ik: [2, 82] }, lb: { th: 70, sh: 0 } }, SP_OUT, { hl: ["la"] }), props: sideCable(true) }] },

  { id: "riab-pallof-squat", anchor: "anklea", frames: [
    { pose: o(STAND, { t: 168, la: { th: 62, sh: -22 }, lb: { th: 58, sh: -24 } }, SP_IN, { hl: ["la"] }), props: sideCable(false) },
    { pose: o(STAND, { t: 168, la: { th: 62, sh: -22 }, lb: { th: 58, sh: -24 } }, SP_OUT, { hl: ["la"] }), props: sideCable(true) }] },

  { id: "riab-affondo-chop", anchor: "anklea", move: [{ j: "wrista", bend: -10 }], frames: [
    { pose: o(FSTAND, { la: { ik: [-4, 82] }, lb: { ik: [4, 82] }, aa: { E: [-20, -20], Wr: [-28, -44] }, ab: { E: [-8, -20], Wr: [-44, -40] } }), props: [{ type: "cable", x: 26, y: 30, to: "wrista" }] },
    { pose: o(FSTAND, FSPLIT_DOWN, { aa: { E: [6, 26], Wr: [34, 42] }, ab: { E: [-4, 26], Wr: [6, 44] }, hl: ["aa", "ab", "la"] }), props: [{ type: "cable", x: 26, y: 30, to: "wrista" }] }] },

  { id: "riab-rdl-mono-rematore", anchor: "anklea", frames: [
    { pose: { t: 96, la: { ik: [16, 82] }, lb: { th: -84, sh: -84, ft: 0 }, aa: { ua: 4, fa: 4 }, ab: { ua: 30, fa: 40 }, hl: ["la"] }, props: [{ type: "cable", x: "anklea", dx: 110, y: 168, to: "wrista" }] },
    { pose: { t: 180, la: {}, lb: { th: -6, sh: -40 }, aa: { ik: [-10, 46] }, ab: { ua: 10, fa: 10 }, hl: ["la", "aa"] }, props: [{ type: "cable", x: "anklea", dx: 110, y: 168, to: "wrista" }] }] },

  { id: "riab-affondo-camminato-offset", ghost: false, frames: [
    { pose: { t: 178, la: { ik: [36, 52] }, lb: { th: -18, sh: -95, ft: 20 }, aa: { ua: 2, fa: 2 }, ab: { ua: 8, fa: 8 }, hl: ["la"] }, props: [{ type: "kb", at: "handa" }, { type: "arrow", from: [210, 40], to: [260, 40] }] }] },

  { id: "riab-perturbazioni-tavole", frames: [
    { pose: { t: 176, la: { ik: [6, 80] }, lb: { ik: [-6, 80] }, aa: { ua: 30, fa: 40 }, ab: { ua: 20, fa: 30 } }, props: (J) => [{ type: "raw", svg: `<rect x="${f1(J.heelb[0] - 14)}" y="166" width="${f1(J.toea[0] - J.heelb[0] + 28)}" height="6" rx="2" fill="${C.wood}"/><path d="M${f1(J.pelvis[0] - 10)},172 Q${f1(J.pelvis[0])},196 ${f1(J.pelvis[0] + 10)},172 Z" fill="${C.eqLight}"/>` }, { type: "arc", at: ["pelvis", 0, 82], r: 40, ry: 12, a0: 200, a1: 340 }, T(240, 40, "tavola basculante")] }] },

  { id: "riab-split-squat-perturbazioni", frames: [
    { pose: { t: 178, la: { ik: [36, 46] }, lb: { th: -22, sh: -92, pf: 30 }, aa: { ik: R(178, [14, 16]) }, ab: { ik: R(178, [14, 16]) }, hl: ["la"] }, props: [{ type: "arrow", from: ["pelvis", -40, -6], to: ["pelvis", -14, -6] }, { type: "arrow", from: ["shoulder", 40, 0], to: ["shoulder", 14, 0] }, T(240, 30, "spinte brevi e casuali")] }] },

  copyFrom(SUPER, "pm-carry-kettlebell-capovolto", "riab-carry-bottom-up"),

  { id: "riab-equilibrio-dual-task", frames: [
    { pose: { t: 176, la: { ik: [12, 80] }, lb: { th: 40, sh: -40 }, aa: { ua: 10, fa: 10 }, ab: { ua: -10, fa: -6 }, hl: ["la"] }, props: [{ type: "raw", svg: `<rect x="186" y="18" width="92" height="30" rx="14" fill="#fff" stroke="${C.eqLight}" stroke-width="1.5"/><text x="232" y="38" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="${C.hl}" text-anchor="middle">100 − 7 = ?</text>` }] }] },

  { id: "riab-atterraggio-dual-task", ghost: false, vb: VB, frames: [
    { pose: o(STAND, { lift: 30, dx: -60, aa: { ua: 10, fa: 10 }, ab: { ua: 10, fa: 10 } }), props: [{ type: "box", x: "anklea", dx: -26, w: 46, top: 156 }] },
    { pose: { shift: 90, lift: 30, t: 178, la: { th: 20, sh: -10, pf: 30 }, lb: { th: 14, sh: -16, pf: 30 }, aa: { ua: 160, fa: 165 }, ab: { ua: 156, fa: 160 } }, props: [{ type: "box", x: "pelvis", dx: -116, w: 46, top: 156 }, { type: "volley", at: ["handa", 2, -8], r: 8 }, { type: "arrow", from: [300, 0], to: ["handa", 14, -10] }] }] },

  { id: "riab-hop-reattivo", vb: [0, 0, 300, 200], custom: () => [diagram(person(150, 140) + dot(150, 60, "1") + dot(80, 80, "2") + dot(220, 80, "3") + dot(60, 140, "4") + dot(240, 140, "5") + dash([150, 128], [150, 74], 0) + dash([142, 132], [90, 90], 0), "hop monopodalico verso il bersaglio chiamato")] },

  { id: "riab-cambio-direzione-reattivo", vb: [0, 0, 300, 200], custom: () => [diagram(person(150, 156) + dash([150, 144], [150, 96], 0) + M.arrowPath([150, 90], [86, 54], 0) + M.arrowPath([150, 90], [214, 54], 0) + M.arrowPath([150, 90], [150, 34], 0) + `<text x="168" y="100" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="${C.hl}">?</text>`, "corsa e cambio di direzione al segnale")] },

  { id: "riab-affondo-reattivo-direzioni", vb: [0, 0, 300, 200], custom: () => {
    let s = `<circle cx="150" cy="94" r="62" fill="none" stroke="${C.eqLight}" stroke-width="2" stroke-dasharray="4 4"/>` + person(150, 94);
    [[12, 0], [3, 90], [6, 180], [9, 270], [4.5, 135], [7.5, 225]].forEach(([h, a]) => { const r = (a - 90) * Math.PI / 180; const x = 150 + 62 * Math.cos(r), y = 94 + 62 * Math.sin(r); s += M.arrowPath([150 + 16 * Math.cos(r), 94 + 16 * Math.sin(r)], [150 + 48 * Math.cos(r), 94 + 48 * Math.sin(r)], 0) + `<text x="${f1(x)}" y="${f1(y + 4)}" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="${C.eq}" text-anchor="middle">${h === 4.5 ? "4-5" : h === 7.5 ? "7-8" : h}</text>`; });
    return [diagram(s, "affondo nella direzione dell'ora chiamata")]; } },

  { id: "riab-affondo-overhead", anchor: "anklea", vb: [-20, -40, 340, 227], frames: [
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 178, fa: 180 }, ab: { ua: 4, fa: 6 } }, props: [{ type: "kb", at: ["handa", 0, -2], up: true }] },
    { pose: { t: 178, la: { ik: [36, 52] }, lb: { th: -18, sh: -95, ft: 20 }, aa: { ua: 178, fa: 180 }, ab: { ua: 4, fa: 6 }, hl: ["la", "aa"] }, props: [{ type: "kb", at: ["handa", 0, -2], up: true }] }] },

  { id: "riab-step-up-press", anchor: "anklea", vb: [-20, -40, 340, 227], frames: [
    { pose: { t: 172, la: { ik: [30, 44] }, lb: { ik: [-10, 82] }, aa: { ua: 4, fa: 6 }, ab: { ua: 30, fa: 175 } }, props: [{ type: "box", x: "anklea", dx: -20, w: 50, top: "heela", dy: 2 }, { type: "db", at: "handb" }] },
    { pose: { t: 180, la: {}, lb: { th: 100, sh: 10 }, aa: { ua: 4, fa: 6 }, ab: { ua: 176, fa: 178 }, hl: ["la", "ab"] }, props: [{ type: "box", x: "anklea", dx: -20, w: 50, top: "heela", dy: 2 }, { type: "db", at: "handb" }] }] },

  { id: "riab-landmine-affondo-press", anchor: "anklea", frames: [
    { pose: { t: 172, la: { ik: [36, 52] }, lb: { th: -18, sh: -95, ft: 20 }, aa: { ik: [10, 8] }, ab: { ua: 10, fa: 10 }, hl: ["la"] }, props: [{ type: "landmine", x: "pelvis", dx: 130, at: "handa" }] },
    { pose: { t: 176, la: {}, lb: {}, aa: { ua: 128, fa: 128 }, ab: { ua: 10, fa: 10 }, hl: ["aa"] }, props: [{ type: "landmine", x: "pelvis", dx: 130, at: "handa" }] }] },
];
