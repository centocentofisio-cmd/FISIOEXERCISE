/* Ginocchio, piede e caviglia */
"use strict";
const { SIT, VB, R, o, STAND, FSTAND, SUP, HOOK, PRONE, M } = require("./libreria");
const H = require("./mani");
const ANCA = require("./pose-anca");
const { C, f1 } = M;

const copy = (from, id) => Object.assign({}, ANCA.find((d) => d.id === from), { id });
const T = (x, y, t, s) => ({ type: "text", x, y, text: t, size: s || 10 });
const wallHand = (J) => ({ type: "wall", x: J.fingersa[0] + 3, w: 10 });
const ZLEG = { j: "kneea", w: 200, dy: -10 };

module.exports = [
  /* ---------- GINOCCHIO ---------- */
  { id: "gin-quad-set", anchor: "pelvis", zoom: ZLEG, frames: [
    { pose: o(SUP, { la: { th: 92, sh: 86 }, lb: { th: 90, sh: 90 }, groundOn: ["pelvis"] }), props: [{ type: "towel", at: ["anklea", 0, 8], w: 12, h: 7 }] },
    { pose: o(SUP, { la: { th: 92, sh: 92 }, lb: { th: 90, sh: 90 }, hl: ["la"] }), props: [{ type: "towel", at: ["anklea", 0, 8], w: 12, h: 7 }, { type: "arrow", from: ["kneea", 0, -24], to: ["kneea", 0, -10] }] }] },

  { id: "gin-slr", anchor: "pelvis", move: [{ j: "anklea", bend: -10 }], frames: [
    { pose: o(SUP, { la: { th: 90, sh: 90 }, lb: { ik: [48, 4], ft: 90 }, groundOn: ["pelvis"], hl: ["la"] }) },
    { pose: o(SUP, { la: { th: 128, sh: 128 }, lb: { ik: [48, 4], ft: 90 }, hl: ["la"] }) }] },

  { id: "gin-heel-slide", anchor: "pelvis", move: [{ j: "anklea", bend: 0, off: [0, 8] }], frames: [
    { pose: o(SUP, { la: { th: 90, sh: 90 }, lb: { th: 90, sh: 90 }, groundOn: ["pelvis"], hl: ["la"] }), props: [{ type: "towel", at: ["heela", 0, 3], w: 14, h: 4 }] },
    { pose: o(SUP, { la: { ik: [44, 6], ft: 100 }, lb: { th: 90, sh: 90 }, hl: ["la"] }), props: [{ type: "towel", at: ["heela", 0, 3], w: 14, h: 4 }] }] },

  { id: "gin-prone-hang", anchor: "pelvis", frames: [
    { pose: o(PRONE, { la: { th: -90, sh: -104, ft: -10 }, lb: { th: -90, sh: -104, ft: -10 }, groundOn: ["pelvis"], lift: 70, hl: ["la"] }), props: (J) => [{ type: "bench", x: J.kneea[0] + 4, w: J.headTop[0] - J.kneea[0], top: J.pelvis[1] + 11 }] },
    { pose: o(PRONE, { la: { th: -90, sh: -84, ft: 0 }, lb: { th: -90, sh: -84, ft: 0 }, hl: ["la"] }), props: (J) => [{ type: "bench", x: J.kneea[0] + 4, w: J.headTop[0] - J.kneea[0], top: J.pelvis[1] + 11 }, { type: "arrow", from: ["anklea", 0, -14], to: ["anklea", 0, -2] }] }] },

  { id: "gin-short-arc", anchor: "pelvis", zoom: { j: "kneea", w: 200, dy: -10 }, frames: [
    { pose: o(SUP, { la: { th: 104, sh: 70 }, lb: { th: 90, sh: 90 }, groundOn: ["pelvis"], hl: ["la"] }), props: [{ type: "roller", at: ["kneea", 0, 12], r: 9 }] },
    { pose: o(SUP, { la: { th: 104, sh: 104 }, lb: { th: 90, sh: 90 }, hl: ["la"] }), props: [{ type: "roller", at: ["kneea", 0, 12], r: 9 }, { type: "arc", at: "kneea", r: 30, a0: 30, a1: -10 }] }] },

  { id: "gin-tke", anchor: "anklea", frames: [
    { pose: o(STAND, { t: 176, la: { th: 16, sh: -10 }, lb: { ik: [-14, 82] }, hl: ["la"] }), props: [{ type: "post", x: "kneea", dx: 70, y: 100 }, { type: "band", from: ["kneea", 70, 0], to: ["kneea", -6, 0] }] },
    { pose: o(STAND, { la: {}, lb: { ik: [-14, 82] }, hl: ["la"] }), props: [{ type: "post", x: "kneea", dx: 70, y: 100 }, { type: "band", from: ["kneea", 70, 0], to: ["kneea", -6, 0] }, { type: "arrow", from: ["kneea", -26, 0], to: ["kneea", -12, 0] }] }] },

  { id: "gin-wall-sit", frames: [
    { pose: { t: 180, la: { th: 90, sh: 0 }, lb: { th: 88, sh: 0 }, aa: { ik: R(180, [12, 18]) }, ab: { ik: R(180, [12, 18]) }, hl: ["la"] }, props: (J) => [{ type: "wallL", x: J.pelvis[0] - 11, w: 12 }] }] },

  { id: "gin-reverse-nordic", anchor: "kneea", frames: [
    { pose: { t: 180, la: { th: 0, sh: -92, ft: -95 }, aa: { ik: [14, 20] }, ab: { ik: [14, 20] }, groundOn: ["kneea"], hl: ["la"] } },
    { pose: { t: 212, la: { th: 32, sh: -92, ft: -95 }, aa: { ik: R(212, [14, 20]) }, ab: { ik: R(212, [14, 20]) }, hl: ["la"] }, props: [{ type: "arc", at: "kneea", r: 70, a0: 250, a1: 230 }] }] },

  { id: "gin-squat-rnt", anchor: "anklea", frames: [
    { pose: o(FSTAND, { la: { ik: [-6, 82] }, lb: { ik: [6, 82] }, aa: { E: [6, 22], Wr: [16, 10] }, ab: { E: [-6, 22], Wr: [-16, 10] }, hl: ["la"] }), props: [{ type: "post", x: "pelvis", dx: 80, y: 120 }, { type: "band", from: ["pelvis", 80, 44], to: ["kneea", 4, 0] }] },
    { pose: o(FSTAND, { la: { K: [-10, 26], A: [-8, 60] }, lb: { K: [10, 26], A: [8, 60] }, aa: { E: [6, 22], Wr: [16, 10] }, ab: { E: [-6, 22], Wr: [-16, 10] }, hl: ["la"] }), props: [{ type: "post", x: "pelvis", dx: 80, y: 120 }, { type: "band", from: ["pelvis", 80, 44], to: ["kneea", 4, 0] }, { type: "arrow", from: ["kneea", 6, -12], to: ["kneea", -10, -12] }] }] },

  { id: "gin-cyclist-squat", anchor: "anklea", frames: [
    { pose: { t: 178, la: { pf: 15 }, lb: { pf: 15 }, aa: { ik: R(178, [14, 16]) }, ab: { ik: R(178, [14, 16]) }, groundOn: ["heela"], lift: 7, hl: ["la"] }, props: (J) => [{ type: "poly", pts: [[J.heela[0] - 6, 186], [J.heela[0] - 6, J.heela[1] + 2], [J.heela[0] + 26, 186]] }, { type: "kb", at: ["shoulder", 10, 14] }] },
    { pose: { t: 168, la: { ik: [44, 32], pf: 15 }, lb: { ik: [44, 32], pf: 15 }, aa: { ik: R(168, [14, 16]) }, ab: { ik: R(168, [14, 16]) }, hl: ["la"] }, props: (J) => [{ type: "poly", pts: [[J.heela[0] - 6, 186], [J.heela[0] - 6, J.heela[1] + 2], [J.heela[0] + 26, 186]] }, { type: "kb", at: ["shoulder", 10, 14] }] }] },

  copy("anca-landmine-squat", "gin-landmine-squat"),

  { id: "gin-spanish-squat", anchor: "anklea", frames: [
    { pose: { t: 180, la: {}, lb: {}, aa: { ua: 4, fa: 6 }, ab: { ua: 2, fa: 4 } }, props: [{ type: "post", x: "anklea", dx: 80, y: 30 }, { type: "strap", from: ["kneea", 80, 0], to: ["kneea", -6, 0] }] },
    { pose: { t: 160, la: { th: 84, sh: 2 }, lb: { th: 84, sh: 2 }, aa: { ua: 80, fa: 80 }, ab: { ua: 78, fa: 78 }, hl: ["la"] }, props: [{ type: "post", x: "anklea", dx: 80, y: 30 }, { type: "strap", from: ["kneea", 80, 2], to: ["kneea", -6, 0] }] }] },

  { id: "gin-decline-squat", anchor: "anklea", frames: [
    { pose: { t: 180, la: { ft: 66 }, lb: { th: 20, sh: 10 }, aa: { ua: 40, fa: 50 }, ab: { ua: 40, fa: 50 }, groundOn: ["heela"], lift: 18, hl: ["la"] }, props: (J) => [{ type: "poly", pts: [[J.heela[0] - 6, 186], [J.heela[0] - 6, J.heela[1] + 2], [J.toea[0] + 12, J.toea[1] + 8], [J.toea[0] + 12, 186]] }] },
    { pose: { t: 172, la: { ik: [36, 64], ft: 66 }, lb: { th: 40, sh: 20 }, aa: { ua: 70, fa: 75 }, ab: { ua: 70, fa: 75 }, hl: ["la"] }, props: (J) => [{ type: "poly", pts: [[J.heela[0] - 6, 186], [J.heela[0] - 6, J.heela[1] + 2], [J.toea[0] + 12, J.toea[1] + 8], [J.toea[0] + 12, 186]] }] }] },

  copy("anca-skater-squat", "gin-skater-squat"),

  { id: "gin-step-down-anteriore", anchor: "anklea", frames: [
    { pose: { t: 180, la: {}, lb: { th: 22, sh: 22, pf: 10 }, aa: { ua: 30, fa: 40 }, ab: { ua: 30, fa: 40 }, groundOn: ["heela"], lift: 22, hl: ["la"] }, props: [{ type: "box", x: "heela", dx: -14, w: 34, top: "heela", dy: 2 }] },
    { pose: { t: 168, la: { ik: [28, 58] }, lb: { th: 28, sh: 30, pf: 0 }, aa: { ua: 60, fa: 70 }, ab: { ua: 60, fa: 70 }, hl: ["la"] }, props: [{ type: "box", x: "heela", dx: -14, w: 34, top: "heela", dy: 2 }] }] },

  copy("anca-step-up-laterale", "gin-step-up-laterale"),

  { id: "gin-equilibrio-mono", frames: [
    { pose: { t: 172, la: { ik: [14, 78] }, lb: { th: 40, sh: -30 }, aa: { ua: 50, fa: 60 }, ab: { ua: -30, fa: -20 }, hl: ["la"] }, props: [{ type: "board", under: "heela" }] }] },

  copy("anca-y-balance", "gin-y-balance"),

  { id: "gin-atterraggio-bipodalico", ghost: false, vb: VB, frames: [
    { pose: o(STAND, { lift: 30, dx: -60, aa: { ua: 10, fa: 10 }, ab: { ua: 10, fa: 10 } }), props: [{ type: "box", x: "anklea", dx: -26, w: 46, top: 156 }] },
    { pose: { shift: 100, t: 145, la: { ik: [26, 54] }, lb: { ik: [24, 55] }, aa: { ua: 50, fa: 60 }, ab: { ua: 40, fa: 50 }, hl: ["la"] }, props: [{ type: "box", x: "pelvis", dx: -126, w: 46, top: 156 }] }] },

  { id: "gin-cambio-direzione", ghost: false, frames: [
    { pose: o(FSTAND, { dx: -20, la: { K: [-2, 42], A: [-4, 82] }, lb: { K: [8, 28], A: [10, 54] }, aa: { E: [-12, 22], Wr: [-4, 6] }, ab: { E: [12, 26], Wr: [14, 50] } }), props: [{ type: "cone", x: 240 }] },
    { pose: o(FSTAND, { free: true, dx: 20, t: 196, la: { ik: [-46, 66] }, lb: { K: [10, 30], A: [16, 58] }, aa: { E: [-12, 22], Wr: [4, 10] }, ab: { E: [16, 18], Wr: [26, 36] }, hl: ["la"] }), props: [{ type: "cone", x: 240 }, { type: "arrow", from: [190, 120], to: [250, 110] }] }] },

  copy("anca-muro-spostamento", "gin-muro-pallavolo"),

  /* ---------- PIEDE E CAVIGLIA ---------- */
  { id: "pc-calf-raise-mono", move: [{ j: "head", bend: 0, off: [16, 0] }], frames: [
    { pose: { t: 180, la: {}, lb: { th: 0, sh: -70 }, aa: { ik: [40, 0] }, ab: { ua: 6, fa: 6 }, hl: ["la"] }, props: (J) => [wallHand(J)] },
    { pose: { t: 180, la: { pf: 45 }, lb: { th: 0, sh: -70 }, aa: { ik: [40, 0] }, ab: { ua: 6, fa: 6 }, groundOn: ["toea"], hl: ["la"] }, props: (J) => [wallHand(J)] }] },

  { id: "pc-eccentrico-soleo", anchor: "toea", frames: [
    { pose: { t: 176, la: { ik: [10, 78], pf: 35 }, lb: { th: 20, sh: -50 }, aa: { ik: [40, 2] }, ab: { ua: 6, fa: 6 }, groundOn: ["toea"], lift: 22, hl: ["la"] }, props: (J) => [{ type: "box", x: J.toea[0] - 14, w: 50, top: J.toea[1] + 2 }, wallHand(J)] },
    { pose: { t: 176, la: { ik: [14, 72], pf: -20 }, lb: { th: 20, sh: -50 }, aa: { ik: [40, 6] }, ab: { ua: 6, fa: 6 }, hl: ["la"] }, props: (J) => [{ type: "box", x: J.toea[0] - 14, w: 50, top: J.toea[1] + 2 }, wallHand(J), { type: "arrow", from: ["heela", -8, -10], to: ["heela", -8, 6] }] }] },

  { id: "pc-isometria-flessori-plantari", frames: [
    { pose: { t: 180, la: { pf: 25 }, lb: { th: 0, sh: -70 }, aa: { ik: [40, 0] }, ab: { ua: 6, fa: 6 }, groundOn: ["toea"], hl: ["la"] }, props: (J) => [wallHand(J), T(230, 30, "tenere a metà altezza")] }] },

  { id: "pc-heel-raise-rathleff", anchor: "toea", frames: [
    { pose: { t: 180, la: { pf: -15 }, lb: { th: 0, sh: -70 }, aa: { ik: [40, 0] }, ab: { ua: 6, fa: 6 }, groundOn: ["toea"], lift: 22, hl: ["la"] }, props: (J) => [{ type: "box", x: J.toea[0] - 16, w: 50, top: J.toea[1] + 4 }, { type: "towel", at: ["toea", 0, 2], w: 10, h: 6 }, wallHand(J)] },
    { pose: { t: 180, la: { pf: 45 }, lb: { th: 0, sh: -70 }, aa: { ik: [40, 0] }, ab: { ua: 6, fa: 6 }, hl: ["la"] }, props: (J) => [{ type: "box", x: J.toea[0] - 16, w: 50, top: J.toea[1] + 4 }, { type: "towel", at: ["toea", 0, 2], w: 10, h: 6 }, wallHand(J)] }] },

  { id: "pc-dorsiflessione-elastico", anchor: "pelvis", frames: [
    { pose: { t: 172, la: { th: 90, sh: 90, pf: 30 }, lb: { th: 90, sh: 90, pf: 30 }, aa: { ik: [-12, 52] }, ab: { ik: [-12, 52] }, groundOn: ["pelvis"], hl: ["la"] }, props: [{ type: "post", x: "toea", dx: 50, y: 150 }, { type: "band", from: ["toea", 50, 0], to: ["toea", -4, -2] }] },
    { pose: { t: 172, la: { th: 90, sh: 90, pf: -20 }, lb: { th: 90, sh: 90, pf: 30 }, aa: { ik: [-12, 52] }, ab: { ik: [-12, 52] }, hl: ["la"] }, props: [{ type: "post", x: "toea", dx: 54, y: 150 }, { type: "band", from: ["toea", 54, 16], to: ["toea", -4, -2] }] }] },

  { id: "pc-eversione-elastico", vb: [60, 30, 180, 120], custom: () => soleScene(true) },
  { id: "pc-inversione-elastico", vb: [60, 30, 180, 120], custom: () => soleScene(false) },

  { id: "pc-short-foot", vb: [60, 40, 180, 120], custom: () => {
    const a = H.footSide({ a: [140, 110], arch: 0.1 }), b = H.footSide({ a: [140, 110], arch: 1 });
    const fl = `<rect x="-200" y="136" width="700" height="100" fill="${C.floor}" opacity="0.55"/>`;
    return [H.bg() + fl + a.svg, H.bg() + fl + b.svg + H.arrow([156, 150], [156, 128]) + H.label(150, 156, "arco sollevato, dita rilassate", 8)]; } },

  { id: "pc-flessione-dita", vb: [60, 40, 180, 120], custom: () => {
    const a = H.footSide({ a: [130, 110], hallux: 8, toes: 8 }), b = H.footSide({ a: [130, 110], hallux: -50, toes: -55 });
    const towel = (bunch) => bunch ? `<path d="M140,136 L176,136 q6,-10 12,0 q6,-10 12,0 L240,136 L240,140 L140,140 Z" fill="#E7C66B"/>` : `<rect x="140" y="135" width="100" height="5" fill="#E7C66B"/>`;
    const fl = `<rect x="-200" y="140" width="700" height="100" fill="${C.floor}" opacity="0.55"/>`;
    return [H.bg() + fl + towel(false) + a.svg, H.bg() + fl + towel(true) + b.svg]; } },

  { id: "pc-toe-yoga", vb: [60, 40, 180, 120], custom: () => {
    const a = H.footSide({ a: [140, 110], hallux: 40, toes: -6 }), b = H.footSide({ a: [140, 110], hallux: -6, toes: 40 });
    const fl = `<rect x="-200" y="136" width="700" height="100" fill="${C.floor}" opacity="0.55"/>`;
    return [H.bg() + fl + a.svg + H.label(150, 156, "alluce su, altre dita a terra", 8), H.bg() + fl + b.svg + H.label(150, 156, "alluce a terra, altre dita su", 8)]; } },

  { id: "pc-knee-to-wall", anchor: "anklea", frames: [
    { pose: { t: 176, la: { ik: [10, 82] }, lb: { ik: [-40, 72], pf: 30 }, aa: { ik: [36, 10] }, ab: { ik: [36, 10] } }, props: (J) => [{ type: "wall", x: J.anklea[0] + 40, w: 10 }] },
    { pose: { t: 172, la: { ik: [-26, 64], ft: 90 }, lb: { ik: [-56, 56], pf: 30 }, aa: { ik: [36, 14] }, ab: { ik: [36, 14] }, hl: ["la"] }, props: (J) => [{ type: "wall", x: J.kneea[0] + 6, w: 10 }] }] },

  { id: "pc-mwm-dorsiflessione", anchor: "anklea", frames: [
    { pose: { t: 176, la: { ik: [10, 82] }, lb: { ik: [-40, 72], pf: 30 }, aa: { ua: 6, fa: 6 }, ab: { ua: 6, fa: 6 } }, props: [{ type: "post", x: "anklea", dx: -110, y: 160 }, { type: "band", from: ["anklea", -110, -10], to: ["anklea", 6, 0] }] },
    { pose: { t: 172, la: { ik: [-14, 70], ft: 90 }, lb: { ik: [-50, 60], pf: 30 }, aa: { ua: 6, fa: 6 }, ab: { ua: 6, fa: 6 }, hl: ["la"] }, props: [{ type: "post", x: "anklea", dx: -110, y: 160 }, { type: "band", from: ["anklea", -110, -10], to: ["anklea", 6, 0] }, { type: "arrow", from: ["kneea", 0, -14], to: ["kneea", 16, -14] }] }] },

  { id: "pc-stretch-fascia-plantare", vb: [60, 40, 180, 120], custom: () => {
    const a = H.footSide({ a: [140, 100], shin: 30, arch: 0.4, hallux: 0, toes: 0 }), b = H.footSide({ a: [140, 100], shin: 30, arch: 0.4, hallux: 55, toes: 40 });
    const hand = (p) => `<circle cx="${f1(p[0] + 4)}" cy="${f1(p[1] - 4)}" r="8" fill="${H.SKIN2}"/>`;
    return [H.bg() + a.svg + H.label(150, 156, "piede accavallato sul ginocchio", 8), H.bg() + b.svg + hand(b.toe) + H.arrow([b.toe[0] + 16, b.toe[1] + 8], [b.toe[0] + 8, b.toe[1] - 14], 6) + H.label(150, 156, "dita (alluce) portate verso la tibia", 8)]; } },

  { id: "pc-equilibrio-mono", frames: [
    { pose: { t: 178, la: { ik: [8, 82] }, lb: { th: 30, sh: -40 }, aa: { ua: 20, fa: 30 }, ab: { ua: -20, fa: -20 }, hl: ["la"] } }] },

  Object.assign({}, ANCA.find((d) => d.id === "anca-y-balance"), { id: "pc-star-excursion" }),

  { id: "pc-equilibrio-perturbazioni", anchor: "anklea", frames: [
    { pose: { t: 176, la: { ik: [10, 82] }, lb: { th: 40, sh: 30 }, aa: { ua: 20, fa: 30 }, ab: { ua: -20, fa: -20 }, hl: ["la"] }, props: [{ type: "post", x: "anklea", dx: -100, y: 120 }, { type: "band", from: ["anklea", -100, -40], to: "ankleb" }] },
    { pose: { t: 186, la: { ik: [10, 82] }, lb: { th: -30, sh: -40 }, aa: { ua: 20, fa: 30 }, ab: { ua: -20, fa: -20 }, hl: ["la"] }, props: [{ type: "post", x: "anklea", dx: -100, y: 120 }, { type: "band", from: ["anklea", -100, -40], to: "ankleb" }] }] },

  { id: "pc-cammino-punte-talloni", frames: [
    { pose: { t: 180, la: { ik: [18, 76], pf: 40 }, lb: { ik: [-16, 78], pf: 45 }, aa: { ua: -20, fa: -10 }, ab: { ua: 20, fa: 30 }, hl: ["la", "lb"] }, props: [T(240, 40, "sulle punte")] },
    { pose: { t: 180, la: { ik: [18, 80], pf: -30 }, lb: { ik: [-16, 80], pf: -25 }, aa: { ua: -20, fa: -10 }, ab: { ua: 20, fa: 30 } }, props: [T(240, 40, "sui talloni")] }] },

  { id: "pc-carry-punte", frames: [
    { pose: { t: 180, la: { ik: [16, 76], pf: 40 }, lb: { ik: [-14, 78], pf: 45 }, aa: { ua: 2, fa: 2 }, ab: { ua: 2, fa: 2 }, hl: ["la", "lb"] }, props: [{ type: "db", at: "handa" }] }] },

  { id: "pc-hop-avanti", ghost: false, frames: [
    { pose: { dx: -50, t: 140, la: { ik: [16, 60] }, lb: { th: -20, sh: -80 }, aa: { ua: -60, fa: -50 }, ab: { ua: -60, fa: -50 }, hl: ["la"] } },
    { pose: { shift: 120, t: 148, la: { ik: [22, 62] }, lb: { th: -10, sh: -80 }, aa: { ua: 50, fa: 60 }, ab: { ua: 40, fa: 50 }, hl: ["la"] }, props: [{ type: "arrow", from: [80, 60], to: [180, 60], bend: -20 }] }] },

  { id: "pc-figura-otto", vb: [0, 0, 300, 200], custom: () => {
    let s = H.bg() + `<rect x="20" y="30" width="260" height="140" rx="8" fill="#D9E6E3"/>`;
    s += `<path d="M150,100 C190,40 260,40 260,100 C260,160 190,160 150,100 C110,40 40,40 40,100 C40,160 110,160 150,100" fill="none" stroke="#E0703A" stroke-width="3" stroke-dasharray="7 5"/>`;
    s += M.propSvg({ type: "cone", x: 80, floor: 106 }, {}, "side") + M.propSvg({ type: "cone", x: 220, floor: 106 }, {}, "side");
    s += M.arrowPath([200, 52], [222, 50], 0);
    s += H.label(150, 186, "percorso a otto su un piede (5 m, vista dall'alto)", 11);
    return [s]; } },

  copy("anca-muro-spostamento", "pc-muro-pallavolo"),

  { id: "pc-shuffle-laterale", anchor: "anklea", frames: [
    { pose: o(FSTAND, { la: { K: [-14, 30], A: [-22, 66] }, lb: { K: [14, 30], A: [22, 66] }, aa: { E: [-10, 22], Wr: [6, 34] }, ab: { E: [10, 22], Wr: [-6, 34] } }), props: [{ type: "arrow", from: [190, 120], to: [240, 120] }] },
    { pose: o(FSTAND, { t: 172, la: { K: [-12, 30], A: [-14, 66] }, lb: { K: [22, 28], A: [44, 60] }, aa: { E: [-10, 22], Wr: [6, 34] }, ab: { E: [10, 22], Wr: [-6, 34] }, hl: ["lb"] }), props: [{ type: "line", from: ["ankleb", 14, 8], to: ["ankleb", 14, -30], w: 3, col: "#E0703A" }] }] },
];

function soleScene(ev) {
  // piede destro trattato a sinistra dello schermo (visto dalla pianta), piede sinistro a destra
  const out = [];
  for (const end of [false, true]) {
    const rot = end ? (ev ? -24 : 24) : 0, sx = end ? 0.75 : 1;
    let s = H.bg() + H.sole([110, 100], rot, -sx) + H.sole([180, 100], 0, 1, H.BACK);
    if (ev) s += M.seg([182, 78], [116, 80], 2.6, C.band); // tenuto con il piede opposto
    else s += M.seg([72, 74], [104, 80], 2.6, C.band) + `<rect x="69" y="71" width="6" height="6" fill="${C.eq}"/>`;
    if (end) s += M.propSvg({ type: "arc", at: [110, 100], r: 42, a0: ev ? 290 : 250, a1: ev ? 240 : 300 }, {}, "side");
    s += H.label(150, 146, end ? (ev ? "pianta verso l'esterno" : "pianta verso l'interno") : "piedi visti dalla pianta", 9);
    out.push(s);
  }
  return out;
}
