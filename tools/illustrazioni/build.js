/* Genera le illustrazioni SVG in ill/<id>/0.svg e 1.svg e l'elenco illustrazioni.js.
   Uso (dalla cartella del progetto):  node tools/illustrazioni/build.js
   Le pose sono in tools/illustrazioni/pose-*.js. */
"use strict";
const fs = require("fs");
const path = require("path");
const M = require("./motore");
const mani = require("./mani");

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(ROOT, "ill");
const files = fs.readdirSync(__dirname).filter((f) => /^pose-.*\.js$/.test(f)).sort();
const DEFS = [];
for (const f of files) DEFS.push(...require(path.join(__dirname, f)));

// nomi degli esercizi per i titoli accessibili
global.window = {};
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
for (const m of html.matchAll(/src="(esercizi[^"]*\.js)"/g)) eval(fs.readFileSync(path.join(ROOT, m[1]), "utf8"));
const NOMI = {}; window.ESERCIZI.forEach((e) => (NOMI[e.id] = e.nome));

// inquadratura automatica: ritaglia attorno a figura e attrezzi (proporzione 3:2) per ingrandire il disegno
function autoFit(lays, allProps) {
  const pts = [];
  for (const l of lays) for (const k of Object.keys(l.J)) if (Array.isArray(l.J[k]) && typeof l.J[k][0] === "number") pts.push(l.J[k]);
  const R = (J, r) => { try { if (typeof r === "string") return J[r]; if (Array.isArray(r) && typeof r[0] === "string") return [J[r[0]][0] + (r[1] || 0), J[r[0]][1] + (r[2] || 0)]; if (Array.isArray(r) && typeof r[0] === "number") return r; } catch (e) {} return null; };
  for (const [J, props] of allProps) for (const pr of props) {
    if (pr.type === "text" && typeof pr.x === "number") { const hw = String(pr.text).length * (pr.size || 12) * 0.3; pts.push([pr.x - hw, pr.y - 10], [pr.x + hw, pr.y + 2]); continue; }
    if (["text", "raw", "poly", "line", "net"].includes(pr.type)) continue;
    for (const k of ["at", "from", "to"]) { const q = pr[k] != null ? R(J, pr[k]) : null; if (q) pts.push(q); }
    const nx = typeof pr.x === "number" ? pr.x : null;
    if (nx != null) { pts.push([nx, typeof pr.y === "number" ? pr.y : M.FLOOR]); if (typeof pr.w === "number") pts.push([nx + pr.w, M.FLOOR]); }
  }
  let x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
  let y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  x0 -= 16; x1 += 16; y0 -= 24; y1 = Math.max(y1 + 10, M.FLOOR + 8);
  let w = x1 - x0, h = y1 - y0;
  if (w < 150) { x0 -= (150 - w) / 2; w = 150; }
  if (w / h < 1.5) { const nw = h * 1.5; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / 1.5; y0 -= nh - h; h = nh; }
  // pavimento in basso: il bordo inferiore resta sotto il pavimento
  const yb = y0 + h; if (yb > M.FLOOR + 14) { y0 -= 0; }
  return [Math.round(x0), Math.round(y0), Math.round(w), Math.round(h)];
}

function render(def) {
  if (def.custom) return def.custom(M, mani); // illustrazioni ravvicinate (mano, piede)
  const fr = def.frames;
  const lay0 = M.layout(fr[0].pose);
  const out = [];
  const lays = [lay0];
  const allProps = [];
  for (let i = 1; i < fr.length; i++) {
    const p = fr[i].pose;
    const an = p.anchor || def.anchor;
    const opt = an ? { anchor: [an, lay0.J[an]] } : p.root || p.free ? undefined : { ox: lay0.ox + (p.shift || 0) };
    let l = M.layout(p, opt);
    // arti "stay": l'estremità resta dove era nel primo fotogramma (piede o mano fissi)
    const stay = [["la", "hipa", "anklea"], ["lb", "hipb", "ankleb"], ["aa", "shouldera", "wrista"], ["ab", "shoulderb", "wristb"]].filter(([k]) => p[k] && p[k].stay);
    if (stay.length) {
      const q = Object.assign({}, p);
      for (const [k, root, end] of stay) {
        const tgt = [lay0.J[end][0] - l.J[root][0], lay0.J[end][1] - l.J[root][1]];
        q[k] = Object.assign({}, p[k], { ik: tgt, K: undefined, A: undefined, E: undefined, Wr: undefined });
        if (k[0] === "l" && p[k].ft == null) q[k].ft = lay0.p[k].ft;
        if (k[0] === "a" && p[k].hd == null) q[k].hd = lay0.p[k].hd;
      }
      l = M.layout(q, opt);
    }
    lays.push(l);
  }
  fr.forEach((f, i) => {
    const lay = lays[i];
    const props = (typeof f.props === "function" ? f.props(lay.J) : f.props || []).slice();
    allProps.push([lay.J, props]);
    if (i > 0) {
      const mv = (f.move || def.move || []);
      for (const m of mv) {
        const j = typeof m === "string" ? m : m.j;
        const a = lays[0].J[j], b = lay.J[j];
        const off = (m.off || [0, 0]);
        const sh = 0.18;
        const A = [a[0] + (b[0] - a[0]) * sh + off[0], a[1] + (b[1] - a[1]) * sh + off[1]];
        const B = [a[0] + (b[0] - a[0]) * (1 - sh * 0.6) + off[0], a[1] + (b[1] - a[1]) * (1 - sh * 0.6) + off[1]];
        props.push({ type: "arrow", from: A, to: B, bend: m.bend || 0 });
      }
    }
    const ghost = i > 0 && (f.ghost != null ? f.ghost : def.ghost === true) ? lays[0] : null;
    out.push(M.frameSvg({ lay, props, ghost, noFloor: f.noFloor || def.noFloor }));
  });
  if (!def.vb && !def.zoom) def.vb = autoFit(lays, allProps, def);
  if (def.zoom) { // inquadratura ravvicinata centrata su un'articolazione del primo fotogramma
    const z = def.zoom, c = lays[0].J[z.j || "head"], w = z.w || 150;
    def.vb = [Math.round(c[0] - w / 2 + (z.dx || 0)), Math.round(c[1] - w / 3 + (z.dy || 0)), w, Math.round(w * 2 / 3)];
  }
  return out;
}

if (require.main === module) {
  const only = process.argv[2];
  fs.mkdirSync(OUT, { recursive: true });
  const ids = [];
  const seen = new Set();
  for (const def of DEFS) {
    if (seen.has(def.id)) throw new Error("id duplicato: " + def.id);
    seen.add(def.id);
    if (!NOMI[def.id]) { console.warn("ATTENZIONE id non presente nel database:", def.id); continue; }
    if (only && !def.id.includes(only)) continue;
    let frames; try { frames = render(def); } catch (e) { console.error("ERRORE in", def.id); throw e; }
    const dir = path.join(OUT, def.id);
    fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, f));
    frames.forEach((inner, i) => {
      const cap = frames.length === 1 ? "" : i === 0 ? " – posizione iniziale" : " – posizione finale";
      fs.writeFileSync(path.join(dir, i + ".svg"), M.svgDoc(inner, NOMI[def.id] + cap, def.vb, frames.length > 1 ? i + 1 : 0) + "\n");
    });
    ids.push([def.id, frames.length]);
  }
  if (!only) {
    for (const d of fs.readdirSync(OUT)) if (!seen.has(d)) fs.rmSync(path.join(OUT, d), { recursive: true });
    const map = {}; ids.forEach(([id, n]) => (map[id] = n));
    fs.writeFileSync(path.join(ROOT, "illustrazioni.js"),
      "/* Generato da tools/illustrazioni/build.js – non modificare a mano.\n   Illustrazioni stilizzate originali (FISIOEXERCISE): id esercizio → numero di immagini in ill/<id>/. */\n" +
      "window.ILLUSTRAZIONI = " + JSON.stringify(map) + ";\n");
  }
  console.log("illustrazioni generate:", ids.length);
}
module.exports = { render, DEFS };
