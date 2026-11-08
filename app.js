/* NC Fisioterapia – Schede esercizi. Nessuna dipendenza esterna.
   Dati salvati nel browser: localStorage (testi) + IndexedDB (foto e logo). */
(function () {
"use strict";

/* ---------- utilità ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const oggi = () => new Date().toISOString().slice(0, 10);
const fmtData = (d) => { if (!d) return ""; const [y, m, g] = d.split("-"); return g ? `${g}/${m}/${y}` : d; };
const lines = (t) => String(t || "").split("\n").map((s) => s.trim()).filter(Boolean);
const clone = (o) => JSON.parse(JSON.stringify(o));
const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

const store = {
  get(k, d) { try { const v = localStorage.getItem("ncf:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("ncf:" + k, JSON.stringify(v)); } catch (e) { toast("Memoria del browser piena: esporta un backup e cancella schede vecchie"); } },
};
const idb = (() => {
  let p;
  const db = () => p || (p = new Promise((res, rej) => {
    try { const r = indexedDB.open("ncf", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }
    catch (e) { rej(e); }
  }));
  const tx = (mode, fn) => db().then((d) => new Promise((res, rej) => {
    const t = d.transaction("kv", mode); const req = fn(t.objectStore("kv"));
    t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error);
  }));
  return {
    get: (k) => tx("readonly", (s) => s.get(k)).catch(() => undefined),
    set: (k, v) => tx("readwrite", (s) => s.put(v, k)).catch(() => toast("Impossibile salvare la foto in questo browser")),
    del: (k) => tx("readwrite", (s) => s.delete(k)).catch(() => {}),
    all: () => tx("readonly", (s) => s.getAllKeys()).then(async (keys) => {
      const out = {}; for (const k of keys || []) out[k] = await tx("readonly", (s) => s.get(k)); return out;
    }).catch(() => ({})),
  };
})();

let toastT;
function toast(msg) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600);
}

/* ---------- tassonomia filtri ---------- */
const FILTRI = [
  { key: "distretto", label: "Distretto", valori: ["Anca", "Adduttori", "Ischiocrurali", "Ginocchio", "Lombare", "Core", "Caviglia"] },
  { key: "pattern", label: "Pattern di movimento", valori: ["Squat", "Hinge", "Affondo", "Spinta", "Trazione", "Carry", "Rotazione/anti-rotazione", "Salto/atterraggio", "Analitico", "Mobilità"], arr: true },
  { key: "catena", label: "Catena cinetica", valori: ["Aperta", "Chiusa"] },
  { key: "carico", label: "Carico", valori: ["In carico", "In scarico"] },
  { key: "lateralita", label: "Lateralità", valori: ["Bilaterale", "Unilaterale", "Split stance"] },
  { key: "attrezzatura", label: "Attrezzatura", valori: ["Corpo libero", "Manubri", "Kettlebell", "Bilanciere", "Landmine", "Elastico", "Cavo", "Smith", "Leg extension", "Leg curl"], arr: true },
  { key: "regime", label: "Regime di contrazione", valori: ["Isometrico", "Concentrico", "Eccentrico", "Pliometrico"], arr: true },
  { key: "obiettivo", label: "Obiettivo", valori: ["Mobilità", "Controllo motorio", "Forza", "Ipertrofia", "Potenza", "RFD"], arr: true },
  { key: "fase", label: "Fase riabilitativa", valori: ["Precoce", "Intermedia", "Avanzata", "Ritorno allo sport"], arr: true },
  { key: "specificita", label: "Specificità", valori: ["Generale", "Gesto-specifico"] },
];
/* valori presenti nei file dati dei distretti ma non elencati sopra (es. "Toracica", "Resistenza"): aggiunti in coda */
FILTRI.forEach((f) => {
  const campi = f.key === "distretto" ? ["primario", "secondari"] : [f.key];
  (window.ESERCIZI || []).forEach((e) => campi.forEach((c) => [].concat(e[c] || []).forEach((v) => { if (v && !f.valori.includes(v)) f.valori.push(v); })));
});
const DISTRETTI = FILTRI[0].valori;

const RIGHE = [
  { key: "serie", label: "Serie × ripetizioni / durata", dl: "dl-serie", on: true },
  { key: "carico", label: "Carico (kg, %1RM, elastico)", dl: "dl-carico", on: true },
  { key: "rpe", label: "RPE / RIR", dl: "dl-rpe", on: true },
  { key: "tempo", label: "Tempo esecutivo", dl: "dl-tempo", on: false },
  { key: "recupero", label: "Recupero", dl: "dl-recupero", on: true },
  { key: "note", label: "Note", dl: "", on: false },
];

/* ---------- stato ---------- */
let custom = store.get("custom", { mod: {}, nuovi: [] });
let settings = Object.assign({ studio: "NC Fisioterapia", terapista: "", contatti: "", stampaErrori: false, stampaDescr: true, periodo: "Settimane", n: 4 }, store.get("settings", {}));
let schede = store.get("schede", []);
let scheda = store.get("bozza", null) || nuovaScheda();
let filtri = store.get("filtri", {});
let solPrimario = false;
let cerca = "";
let tab = "esercizi";
const FOTO = {}; // id -> [dataURL, dataURL]
let LOGO = null;

function nuovaScheda() {
  return { id: uid(), paziente: "", data: oggi(), titolo: "", note: "", esercizi: [] };
}
function salvaBozza() { store.set("bozza", scheda); $("#badge").textContent = scheda.esercizi.length; }

function tutti() {
  const base = window.ESERCIZI.map((e) => Object.assign({}, e, custom.mod[e.id] || {}, { origine: custom.mod[e.id] ? "mod" : "base" }));
  return base.concat(custom.nuovi.map((e) => Object.assign({}, e, { origine: "mio" })));
}
const byId = (id) => tutti().find((e) => e.id === id);

function immagini(e) {
  const f = FOTO[e.id];
  if (f && (f[0] || f[1])) return f.filter(Boolean);
  if (e.img) return ["img/" + e.img + "/0.jpg", "img/" + e.img + "/1.jpg"];
  return null;
}
function placeholder(e) {
  const p = (e.pattern || [])[0] || "Esercizio";
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto da caricare">
    <rect width="300" height="200" fill="#E3EBE9"/>
    <g fill="none" stroke="#9DB3AE" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="150" cy="58" r="14"/><path d="M150 74v46M150 86l-26 18M150 86l26 18M150 120l-20 38M150 120l20 38"/>
    </g>
    <text x="150" y="182" text-anchor="middle" font-family="Public Sans,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="#4D6661">${esc(p)} · foto da caricare</text>
  </svg>`;
}
function imgPair(e, cls) {
  const im = immagini(e);
  if (!im) return `<div class="${cls || "pair"}"><figure>${placeholder(e)}</figure></div>`;
  const cap = ["Posizione iniziale", "Posizione finale"];
  return `<div class="${cls || "pair"}">${im.map((src, i) => `<figure><img src="${esc(src)}" alt="${esc(e.nome)}: ${cap[i] || ""}" loading="lazy">${cls ? "" : `<figcaption>${cap[i] || ""}</figcaption>`}</figure>`).join("")}</div>`;
}

/* ---------- filtro ---------- */
function passa(e) {
  for (const f of FILTRI) {
    const v = filtri[f.key]; if (!v) continue;
    if (f.key === "distretto") { if (!(e.primario === v || (!solPrimario && (e.secondari || []).includes(v)))) return false; }
    else if (f.arr) { if (!(e[f.key] || []).includes(v)) return false; }
    else if (e[f.key] !== v) return false;
  }
  if (cerca) {
    const q = cerca.toLowerCase();
    const txt = [e.nome, e.alias, e.muscoli, e.gesto].join(" ").toLowerCase();
    if (!txt.includes(q)) return false;
  }
  return true;
}

/* ---------- viste ---------- */
function render() {
  document.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false"));
  $("#badge").textContent = scheda.esercizi.length;
  $("#brand-name").textContent = settings.studio || "NC Fisioterapia";
  const v = $("#view");
  if (tab === "esercizi") v.innerHTML = viewEsercizi();
  else if (tab === "scheda") v.innerHTML = viewScheda();
  else if (tab === "archivio") v.innerHTML = viewArchivio();
  else v.innerHTML = viewImpostazioni();
}

function viewEsercizi() {
  const lista = tutti().filter(passa).sort((a, b) => a.nome.localeCompare(b.nome, "it"));
  const attivi = Object.values(filtri).filter(Boolean).length;
  const sel = (f) => `<label class="field"><span>${f.label}</span><select id="f-${f.key}" data-filtro="${f.key}"><option value="">Tutti</option>${f.valori.map((x) => `<option ${filtri[f.key] === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></label>`;
  return `<div class="lib">
    <aside class="filters" aria-label="Filtri">
      <label class="field"><span>Cerca</span><input type="search" id="cerca" placeholder="Nome, muscolo, gesto…" value="${esc(cerca)}"></label>
      <div class="two">${FILTRI.map(sel).join("")}</div>
      <label class="chk"><input type="checkbox" id="solo-primario" ${solPrimario ? "checked" : ""}> Distretto solo come primario</label>
      <button class="btn ghost sm" data-act="azzera" ${attivi || cerca ? "" : "disabled"}>Azzera filtri</button>
    </aside>
    <section>
      <div class="lib-head"><h1>Esercizi</h1><span class="count">${lista.length} su ${tutti().length}</span>
        <button class="btn" data-act="nuovo-es">+ Nuovo esercizio</button></div>
      ${lista.length ? `<div class="grid">${lista.map(card).join("")}</div>` : `<div class="empty">Nessun esercizio con questa combinazione di filtri. Prova a togliere un filtro.</div>`}
    </section>
  </div>`;
}
function card(e) {
  const inScheda = scheda.esercizi.some((x) => x.exId === e.id);
  const im = immagini(e);
  return `<article class="card">
    <button class="ph" data-act="apri" data-id="${e.id}" aria-label="Apri ${esc(e.nome)}">${im ? `<img src="${esc(im[0])}" alt="" loading="lazy">` : placeholder(e)}</button>
    <div class="bd"><h3>${esc(e.nome)}</h3><div class="alias">${esc(e.alias || "")}</div>
      <div class="chips">${(e.pattern || []).map((p) => `<span class="chip k">${esc(p)}</span>`).join("")}<span class="chip">${esc(e.lateralita || "")}</span>${(e.fase || []).slice(0, 2).map((p) => `<span class="chip">${esc(p)}</span>`).join("")}${e.specificita === "Gesto-specifico" ? `<span class="chip g">Gesto-specifico</span>` : ""}${e.origine !== "base" ? `<span class="chip g">${e.origine === "mio" ? "Mio" : "Modificato"}</span>` : ""}</div>
      <div class="alias">${esc((e.attrezzatura || []).join(" · "))}</div>
    </div>
    <div class="ft"><button class="btn sm" data-act="apri" data-id="${e.id}">Dettagli</button><button class="btn sm ${inScheda ? "" : "primary"}" data-act="aggiungi" data-id="${e.id}">${inScheda ? "In scheda ✓" : "+ Scheda"}</button></div>
  </article>`;
}

function nomeRif(x) {
  const e = /^[a-z0-9-]+$/.test(x) ? byId(x) : null;
  return e ? `<button class="link" data-act="apri" data-id="${e.id}">${esc(e.nome)}</button>` : esc(x);
}

function dettaglio(id) {
  const e = byId(id); if (!e) return;
  const tag = (l, v) => `<div><dt>${l}</dt><dd>${esc(Array.isArray(v) ? v.join(", ") : v || "–")}</dd></div>`;
  const lst = (t, arr, cls, fn) => (arr && arr.length ? `<div class="sec ${cls || ""}"><h4>${t}</h4><ul>${arr.map((x) => `<li>${fn ? fn(x) : esc(x)}</li>`).join("")}</ul></div>` : "");
  openDlg(`<div class="dlg">
    <div class="dlg-h"><div><h2>${esc(e.nome)}</h2><div class="alias">${esc(e.alias || "")}</div></div><button class="btn ghost sm x" data-act="chiudi" aria-label="Chiudi">✕</button></div>
    <div class="dlg-b">
      ${imgPair(e)}
      <dl class="tags">${tag("Distretto primario", e.primario)}${tag("Distretti secondari", e.secondari)}${tag("Muscoli", e.muscoli)}${tag("Pattern", e.pattern)}${tag("Catena cinetica", e.catena)}${tag("Carico", e.carico)}${tag("Lateralità", e.lateralita)}${tag("Attrezzatura", e.attrezzatura)}${tag("Regime di contrazione", e.regime)}${tag("Obiettivo", e.obiettivo)}${tag("Fase riabilitativa", e.fase)}${tag("Specificità", e.specificita + (e.gesto ? " – " + e.gesto : ""))}</dl>
      <div class="sec"><h4>Descrizione</h4><p style="margin:0">${esc(e.descrizione)}</p></div>
      ${lst("Cue esecutivi", e.cue)}
      ${lst("Errori frequenti", e.errori, "err")}
      ${lst("Progressioni", e.progressioni, "", nomeRif)}
      ${lst("Regressioni", e.regressioni, "", nomeRif)}
      ${e.rif && e.rif.length ? `<div class="sec ref"><h4>Letteratura</h4><ul>${e.rif.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>` : ""}
    </div>
    <div class="dlg-f">
      <label class="btn sm">Carica foto iniziale<input type="file" accept="image/*" hidden data-foto="${e.id}" data-slot="0"></label>
      <label class="btn sm">Carica foto finale<input type="file" accept="image/*" hidden data-foto="${e.id}" data-slot="1"></label>
      ${FOTO[e.id] ? `<button class="btn sm danger" data-act="rimuovi-foto" data-id="${e.id}">Rimuovi mie foto</button>` : ""}
      <button class="btn sm" data-act="modifica" data-id="${e.id}">Modifica testi e filtri</button>
      <button class="btn sm primary" data-act="aggiungi" data-id="${e.id}">+ Aggiungi alla scheda</button>
    </div></div>`);
}

function editor(id) {
  const e = id ? byId(id) : { id: "", nome: "", alias: "", muscoli: "", primario: "Anca", secondari: [], pattern: [], catena: "Chiusa", carico: "In carico", lateralita: "Bilaterale", attrezzatura: [], regime: [], obiettivo: [], fase: [], specificita: "Generale", gesto: "", img: null, descrizione: "", cue: [], errori: [], progressioni: [], regressioni: [], rif: [] };
  const txt = (k, l, cls) => `<label class="field ${cls || ""}"><span>${l}</span><input type="text" id="ed-${k}" name="${k}" value="${esc(e[k] || "")}"></label>`;
  const area = (k, l, hint) => `<label class="field full"><span>${l}</span><textarea id="ed-${k}" name="${k}" placeholder="${hint || "Una voce per riga"}">${esc(Array.isArray(e[k]) ? e[k].join("\n") : e[k] || "")}</textarea></label>`;
  const single = (k, l, vals) => `<label class="field"><span>${l}</span><select id="ed-${k}" name="${k}">${vals.map((v) => `<option ${e[k] === v ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>`;
  const multi = (k, l, vals) => `<fieldset class="field full" style="border:0;padding:0;margin:0"><span>${l}</span><div class="checks">${vals.map((v) => `<label><input type="checkbox" name="${k}" value="${esc(v)}" ${(e[k] || []).includes(v) ? "checked" : ""}>${esc(v)}</label>`).join("")}</div></fieldset>`;
  const F = Object.fromEntries(FILTRI.map((f) => [f.key, f.valori]));
  openDlg(`<form class="dlg" id="form-ed" data-id="${esc(id || "")}">
    <div class="dlg-h"><h2>${id ? "Modifica esercizio" : "Nuovo esercizio"}</h2><button type="button" class="btn ghost sm x" data-act="chiudi" aria-label="Chiudi">✕</button></div>
    <div class="dlg-b"><div class="edit-grid">
      ${txt("nome", "Nome italiano")}${txt("alias", "Nome in letteratura / inglese")}
      ${txt("muscoli", "Muscoli", "full")}
      ${single("primario", "Distretto primario", DISTRETTI)}
      ${multi("secondari", "Distretti secondari", DISTRETTI)}
      ${multi("pattern", "Pattern di movimento", F.pattern)}
      ${single("catena", "Catena cinetica", F.catena)}${single("carico", "Carico", F.carico)}
      ${single("lateralita", "Lateralità", F.lateralita)}${single("specificita", "Specificità", F.specificita)}
      ${txt("gesto", "Gesto / sport (se gesto-specifico)", "full")}
      ${multi("attrezzatura", "Attrezzatura", F.attrezzatura)}
      ${multi("regime", "Regime di contrazione", F.regime)}
      ${multi("obiettivo", "Obiettivo", F.obiettivo)}
      ${multi("fase", "Fase riabilitativa", F.fase)}
      ${area("descrizione", "Descrizione tecnica", "Testo libero")}
      ${area("cue", "Cue esecutivi (uno per riga)")}
      ${area("errori", "Errori frequenti (uno per riga)")}
      ${area("progressioni", "Progressioni (una per riga)")}
      ${area("regressioni", "Regressioni (una per riga)")}
      ${area("rif", "Letteratura (una voce per riga)")}
    </div></div>
    <div class="dlg-f">
      ${id && e.origine === "mod" ? `<button type="button" class="btn sm danger" data-act="ripristina" data-id="${e.id}">Ripristina testo originale</button>` : ""}
      ${id && e.origine === "mio" ? `<button type="button" class="btn sm danger" data-act="elimina-es" data-id="${e.id}">Elimina esercizio</button>` : ""}
      <button type="button" class="btn sm" data-act="chiudi">Annulla</button>
      <button type="submit" class="btn sm primary">Salva</button>
    </div></form>`);
}

function salvaEditor(form) {
  const fd = new FormData(form);
  const id = form.dataset.id;
  const o = {};
  ["nome", "alias", "muscoli", "primario", "catena", "carico", "lateralita", "specificita", "gesto", "descrizione"].forEach((k) => (o[k] = (fd.get(k) || "").toString().trim()));
  ["secondari", "pattern", "attrezzatura", "regime", "obiettivo", "fase"].forEach((k) => (o[k] = fd.getAll(k)));
  ["cue", "errori", "progressioni", "regressioni", "rif"].forEach((k) => (o[k] = lines(fd.get(k))));
  if (!o.nome) { toast("Inserisci almeno il nome dell'esercizio"); return; }
  if (!id) { o.id = "mio-" + uid(); o.img = null; custom.nuovi.push(o); }
  else if (custom.nuovi.some((x) => x.id === id)) { custom.nuovi = custom.nuovi.map((x) => (x.id === id ? Object.assign(x, o) : x)); }
  else custom.mod[id] = o;
  store.set("custom", custom); closeDlg(); render(); toast("Esercizio salvato"); dettaglio(id || o.id);
}

/* ---------- scheda ---------- */
function aggiungi(id) {
  if (scheda.esercizi.some((x) => x.exId === id)) { toast("Già presente nella scheda"); return; }
  const righe = {}; RIGHE.forEach((r) => (righe[r.key] = r.on));
  scheda.esercizi.push({ uid: uid(), exId: id, periodo: settings.periodo, n: settings.n, righe, celle: {}, nota: "" });
  salvaBozza(); toast(`Aggiunto alla scheda (${scheda.esercizi.length})`);
}

function viewScheda() {
  const s = scheda;
  const blocchi = s.esercizi.map((x, i) => {
    const e = byId(x.exId);
    if (!e) return `<div class="ex"><b>Esercizio non trovato</b><button class="btn sm danger" data-act="togli" data-uid="${x.uid}">Rimuovi</button></div>`;
    const cols = Array.from({ length: x.n }, (_, c) => `${x.periodo === "Mesi" ? "Mese" : "Sett."} ${c + 1}`);
    const righe = RIGHE.filter((r) => x.righe[r.key]);
    return `<section class="ex" data-uid="${x.uid}">
      <div class="ex-top">
        ${imgPair(e)}
        <div style="min-width:0"><div class="ex-num">Esercizio ${i + 1}</div><h3 style="font-size:19px">${esc(e.nome)}</h3><div class="alias">${esc(e.alias || "")}</div>
          <p class="ex-desc">${esc(e.descrizione)}</p>
          <ul class="ex-cue">${(e.cue || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
        <div class="ex-ctrl">
          <button class="btn sm" data-act="su" data-uid="${x.uid}" ${i === 0 ? "disabled" : ""} aria-label="Sposta su">↑</button>
          <button class="btn sm" data-act="giu" data-uid="${x.uid}" ${i === s.esercizi.length - 1 ? "disabled" : ""} aria-label="Sposta giù">↓</button>
          <button class="btn sm" data-act="apri" data-id="${e.id}">Info</button>
          <button class="btn sm danger" data-act="togli" data-uid="${x.uid}">Rimuovi</button>
        </div>
      </div>
      <div class="prog-ctrl">
        <label>Progressione per <select id="per-${x.uid}" data-per="${x.uid}"><option ${x.periodo === "Settimane" ? "selected" : ""}>Settimane</option><option ${x.periodo === "Mesi" ? "selected" : ""}>Mesi</option></select></label>
        <label>Colonne <input type="number" id="n-${x.uid}" min="1" max="12" value="${x.n}" data-n="${x.uid}" style="width:64px"></label>
        <div class="toggles" role="group" aria-label="Righe visibili">${RIGHE.map((r) => `<button class="tg" data-riga="${r.key}" data-uid="${x.uid}" aria-pressed="${x.righe[r.key] ? "true" : "false"}">${esc(r.label.split(" (")[0])}</button>`).join("")}</div>
        <button class="btn sm ghost" data-act="copia-col" data-uid="${x.uid}" title="Copia la prima colonna in tutte le altre">Copia 1ª colonna →</button>
      </div>
      ${righe.length ? `<div class="tbl-wrap"><table class="prog"><thead><tr><th></th>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>
        ${righe.map((r) => `<tr><th>${esc(r.label)}</th>${cols.map((_, c) => `<td><input type="text" id="c-${x.uid}-${r.key}-${c}" data-cella="${x.uid}" data-r="${r.key}" data-c="${c}" value="${esc(((x.celle[r.key] || [])[c]) || "")}" ${r.dl ? `list="${r.dl}"` : ""}></td>`).join("")}</tr>`).join("")}
      </tbody></table></div>` : ""}
      <label class="field"><span>Indicazioni per questo esercizio</span><input type="text" id="nota-${x.uid}" data-nota="${x.uid}" value="${esc(x.nota)}" placeholder="Es. aumenta il carico del 5% se RPE ≤ 7 su tutte le serie"></label>
    </section>`;
  }).join("");
  return `
    <div class="sheet-bar"><h1>Scheda paziente</h1>
      <button class="btn" data-act="nuova-scheda">Nuova scheda</button>
      <button class="btn" data-act="salva-scheda">Salva in archivio</button>
      <button class="btn primary" data-act="anteprima" ${s.esercizi.length ? "" : "disabled"}>Anteprima e PDF</button></div>
    <div class="sheet-head">
      <label class="field"><span>Paziente</span><input type="text" id="s-paziente" data-s="paziente" value="${esc(s.paziente)}" placeholder="Nome e cognome"></label>
      <label class="field"><span>Data</span><input type="date" id="s-data" data-s="data" value="${esc(s.data)}"></label>
      <label class="field"><span>Titolo / obiettivo</span><input type="text" id="s-titolo" data-s="titolo" value="${esc(s.titolo)}" placeholder="Es. Tendinopatia glutea – fase 2"></label>
      <label class="field full"><span>Indicazioni generali</span><textarea id="s-note" data-s="note" placeholder="Frequenza settimanale, riscaldamento, gestione del dolore (es. NRS ≤ 3/10 durante e il giorno dopo)…">${esc(s.note)}</textarea></label>
    </div>
    ${s.esercizi.length ? blocchi : `<div class="empty" style="margin-top:16px">La scheda è vuota. Vai su <button class="link" data-tab-go="esercizi">Esercizi</button>, filtra e premi “+ Scheda”.</div>`}
    ${legendaHTML("legend")}`;
}

function legendaHTML(cls) {
  return `<div class="${cls}">
    <div><h3>Scala RPE basata sulle ripetizioni in riserva (RIR)</h3>
    <table><tr><th>RPE</th><th>Descrizione</th></tr>
      <tr><td>10</td><td>Sforzo massimo, 0 ripetizioni in riserva</td></tr>
      <tr><td>9.5</td><td>Nessuna ripetizione in più, forse un po' più di carico</td></tr>
      <tr><td>9</td><td>1 ripetizione in riserva</td></tr>
      <tr><td>8.5</td><td>Sicuramente 1, forse 2 in riserva</td></tr>
      <tr><td>8</td><td>2 ripetizioni in riserva</td></tr>
      <tr><td>7.5</td><td>Sicuramente 2, forse 3 in riserva</td></tr>
      <tr><td>7</td><td>3 ripetizioni in riserva</td></tr>
      <tr><td>5–6</td><td>4–6 ripetizioni in riserva</td></tr>
      <tr><td>3–4</td><td>Sforzo leggero</td></tr>
      <tr><td>1–2</td><td>Sforzo minimo o nullo</td></tr></table>
    <p class="${cls === "legend" ? "note" : ""}" style="margin:4px 0 0">Zourdos MC et al. J Strength Cond Res 2016;30(1):267-75</p></div>
    <div><h3>Tempo esecutivo</h3><p style="margin:0">Quattro cifre in secondi: <b>eccentrica – pausa in basso – concentrica – pausa in alto</b>. Es. 3-1-1-0 = scendi in 3 s, fermati 1 s, sali in 1 s, riparti subito. X = il più veloce possibile.</p></div>
  </div>`;
}

function viewArchivio() {
  const l = schede.slice().sort((a, b) => (b.salvata || "").localeCompare(a.salvata || ""));
  return `<div class="sheet-bar"><h1>Archivio schede</h1>
      <button class="btn" data-act="esporta">Esporta backup</button>
      <label class="btn">Importa backup<input type="file" accept="application/json,.json" hidden id="importa"></label></div>
    ${l.length ? `<div class="list">${l.map((s) => `<div class="li"><div class="t"><b>${esc(s.paziente || "Senza nome")}${s.titolo ? " · " + esc(s.titolo) : ""}</b><span>${fmtData(s.data)} · ${s.esercizi.length} esercizi</span></div>
      <button class="btn sm primary" data-act="apri-scheda" data-sid="${s.id}">Apri</button>
      <button class="btn sm" data-act="duplica-scheda" data-sid="${s.id}">Duplica</button>
      <button class="btn sm danger" data-act="elimina-scheda" data-sid="${s.id}">Elimina</button></div>`).join("")}</div>`
      : `<div class="empty">Nessuna scheda salvata. Compila una scheda e premi “Salva in archivio”.</div>`}
    <p class="note" style="margin-top:16px">Le schede e le foto restano salvate in questo browser, su questo dispositivo. Esporta un backup ogni tanto per non perderle e per spostarle su un altro dispositivo.</p>`;
}

function viewImpostazioni() {
  return `<div class="sheet-bar"><h1>Impostazioni</h1></div>
    <div class="panel"><h3>Intestazione del PDF</h3>
      <label class="field"><span>Nome dello studio</span><input type="text" id="set-studio" data-set="studio" value="${esc(settings.studio)}"></label>
      <label class="field"><span>Fisioterapista</span><input type="text" id="set-terapista" data-set="terapista" value="${esc(settings.terapista)}" placeholder="Dott. Nome Cognome, Fisioterapista"></label>
      <label class="field"><span>Contatti (una riga per voce)</span><textarea id="set-contatti" data-set="contatti" placeholder="Via…, Città&#10;Tel. …&#10;email@…">${esc(settings.contatti)}</textarea></label>
      <div class="row">${LOGO ? `<img class="logo-prev" src="${LOGO}" alt="Logo">` : `<span class="note">Nessun logo caricato: nel PDF compare il nome dello studio.</span>`}
        <label class="btn sm">Carica logo<input type="file" accept="image/*" hidden id="logo-in"></label>
        ${LOGO ? `<button class="btn sm danger" data-act="togli-logo">Rimuovi logo</button>` : ""}</div>
    </div>
    <div class="panel"><h3>Contenuto della scheda stampata</h3>
      <label class="chk"><input type="checkbox" id="set-descr" data-setb="stampaDescr" ${settings.stampaDescr ? "checked" : ""}> Stampa la descrizione tecnica</label>
      <label class="chk"><input type="checkbox" id="set-err" data-setb="stampaErrori" ${settings.stampaErrori ? "checked" : ""}> Stampa anche gli errori frequenti</label>
      <div class="row"><label class="field"><span>Progressione predefinita</span><select id="set-per" data-set="periodo"><option ${settings.periodo === "Settimane" ? "selected" : ""}>Settimane</option><option ${settings.periodo === "Mesi" ? "selected" : ""}>Mesi</option></select></label>
      <label class="field"><span>Colonne predefinite</span><input type="number" id="set-n" min="1" max="12" data-set="n" value="${settings.n}"></label></div>
    </div>
    <div class="panel"><h3>Fonti</h3><p class="note" style="margin:0">Foto: <b>free-exercise-db</b> (github.com/yuhonas/free-exercise-db), licenza Unlicense, pubblico dominio. Gli esercizi senza foto mostrano un segnaposto: puoi caricare le tue foto dal dettaglio di ogni esercizio. Testi scritti per ${esc(settings.studio)}.</p></div>`;
}

/* ---------- stampa ---------- */
function buildPrint() {
  const s = scheda;
  const ex = s.esercizi.map((x, i) => {
    const e = byId(x.exId); if (!e) return "";
    const im = immagini(e);
    const cols = Array.from({ length: x.n }, (_, c) => `${x.periodo === "Mesi" ? "Mese" : "Sett."} ${c + 1}`);
    const righe = RIGHE.filter((r) => x.righe[r.key]);
    return `<section class="pr-ex">
      <h2><span class="n">${i + 1}</span><span>${esc(e.nome)}</span><small>${esc(e.alias || "")}</small></h2>
      <div class="pr-body">
        <div class="pr-imgs ${im && im.length > 1 ? "" : "one"}">${im ? im.map((src) => `<img src="${esc(src)}" alt="">`).join("") : placeholder(e)}</div>
        <div>
          ${settings.stampaDescr ? `<p>${esc(e.descrizione)}</p>` : ""}
          ${e.cue && e.cue.length ? `<h4>Come eseguirlo</h4><ul>${e.cue.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
          ${settings.stampaErrori && e.errori && e.errori.length ? `<h4>Da evitare</h4><ul>${e.errori.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
      ${righe.length ? `<table class="pr-tab"><thead><tr><th></th>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${righe.map((r) => `<tr><th>${esc(r.label.split(" (")[0])}</th>${cols.map((_, c) => `<td>${esc(((x.celle[r.key] || [])[c]) || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""}
      ${x.nota ? `<div class="pr-exnote">${esc(x.nota)}</div>` : ""}
    </section>`;
  }).join("");
  const usaRpe = s.esercizi.some((x) => x.righe.rpe || x.righe.tempo);
  $("#print-root").innerHTML = `<div class="pr">
    <div class="pr-head"><div class="pr-logo">${LOGO ? `<img src="${LOGO}" alt="${esc(settings.studio)}">` : `<div class="txt">${esc(settings.studio)}</div>`}</div>
      <div class="pr-studio">${settings.terapista ? `<b>${esc(settings.terapista)}</b>\n` : ""}${esc(settings.contatti)}</div></div>
    <div class="pr-paz"><div><span>Paziente</span><b>${esc(s.paziente || "–")}</b></div><div><span>Data</span><b>${fmtData(s.data)}</b></div>
      ${s.titolo ? `<div style="grid-column:1/-1"><span>Obiettivo</span><b>${esc(s.titolo)}</b></div>` : ""}</div>
    ${s.note ? `<div class="pr-note">${esc(s.note)}</div>` : ""}
    ${ex}
    ${usaRpe ? legendaHTML("pr-legend") : ""}
    <div class="pr-foot">${esc(settings.studio)} · Scheda personale, da eseguire secondo le indicazioni del fisioterapista.</div>
  </div>`;
}
function stampa() {
  buildPrint();
  if (inFrame) toast("In questa anteprima la stampa è bloccata: usa la versione pubblicata su Netlify o GitHub Pages");
  setTimeout(() => window.print(), 50);
}
window.addEventListener("beforeprint", buildPrint);

/* ---------- dialog ---------- */
function openDlg(html) { const d = $("#dlg"); d.innerHTML = html; if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } } d.scrollTop = 0; const b = d.querySelector(".dlg-b"); if (b) b.scrollTop = 0; }
function closeDlg() { const d = $("#dlg"); if (d.open) d.close(); else d.removeAttribute("open"); }

/* ---------- immagini ---------- */
function comprimi(file, max = 900) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement("canvas");
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(im, 0, 0, c.width, c.height);
      res(file.type === "image/png" && max < 900 ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
    }; im.onerror = rej; im.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}

/* ---------- backup ---------- */
async function esporta() {
  const foto = {}; Object.keys(FOTO).forEach((k) => (foto[k] = FOTO[k]));
  const data = { app: "ncf-schede", versione: 1, esportato: new Date().toISOString(), custom, settings, schede, bozza: scheda, foto, logo: LOGO };
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `backup-schede-${oggi()}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  if (inFrame) toast("Nell'anteprima i download sono bloccati: usa la versione pubblicata");
}
async function importa(file) {
  try {
    const d = JSON.parse(await file.text());
    if (d.app !== "ncf-schede") throw new Error();
    custom = d.custom || custom; settings = Object.assign(settings, d.settings || {}); schede = d.schede || schede; if (d.bozza) scheda = d.bozza;
    store.set("custom", custom); store.set("settings", settings); store.set("schede", schede); salvaBozza();
    for (const k of Object.keys(d.foto || {})) { FOTO[k] = d.foto[k]; await idb.set("foto:" + k, d.foto[k]); }
    if (d.logo) { LOGO = d.logo; await idb.set("logo", d.logo); }
    render(); toast("Backup importato");
  } catch (e) { toast("Il file non è un backup valido di questa app"); }
}

/* ---------- eventi ---------- */
function trova(uidX) { return scheda.esercizi.find((x) => x.uid === uidX); }

document.addEventListener("click", async (ev) => {
  const t = ev.target.closest("[data-tab],[data-tab-go],[data-act],[data-riga]");
  if (!t) { if (ev.target === $("#dlg")) closeDlg(); return; }
  if (t.dataset.tab || t.dataset.tabGo) { tab = t.dataset.tab || t.dataset.tabGo; render(); window.scrollTo(0, 0); return; }
  if (t.dataset.riga) { const x = trova(t.dataset.uid); x.righe[t.dataset.riga] = !x.righe[t.dataset.riga]; salvaBozza(); render(); return; }
  const id = t.dataset.id, a = t.dataset.act;
  switch (a) {
    case "apri": dettaglio(id); break;
    case "chiudi": closeDlg(); break;
    case "aggiungi": aggiungi(id); if ($("#dlg").open) closeDlg(); render(); break;
    case "azzera": filtri = {}; cerca = ""; store.set("filtri", filtri); render(); break;
    case "nuovo-es": editor(null); break;
    case "modifica": editor(id); break;
    case "ripristina": delete custom.mod[id]; store.set("custom", custom); closeDlg(); render(); toast("Testo originale ripristinato"); break;
    case "elimina-es":
      if (t.dataset.conferma !== "1") { t.dataset.conferma = "1"; t.textContent = "Conferma eliminazione"; return; }
      custom.nuovi = custom.nuovi.filter((x) => x.id !== id); store.set("custom", custom); closeDlg(); render(); toast("Esercizio eliminato"); break;
    case "rimuovi-foto": delete FOTO[id]; await idb.del("foto:" + id); dettaglio(id); render(); break;
    case "togli": scheda.esercizi = scheda.esercizi.filter((x) => x.uid !== t.dataset.uid); salvaBozza(); render(); break;
    case "su": case "giu": {
      const i = scheda.esercizi.findIndex((x) => x.uid === t.dataset.uid); const j = a === "su" ? i - 1 : i + 1;
      if (j < 0 || j >= scheda.esercizi.length) return; const arr = scheda.esercizi; [arr[i], arr[j]] = [arr[j], arr[i]]; salvaBozza(); render(); break; }
    case "copia-col": {
      const x = trova(t.dataset.uid); RIGHE.forEach((r) => { const c = x.celle[r.key] || []; if (c[0]) { x.celle[r.key] = Array.from({ length: x.n }, (_, k) => c[k] || c[0]); } });
      salvaBozza(); render(); break; }
    case "nuova-scheda":
      if (scheda.esercizi.length && t.dataset.conferma !== "1") { t.dataset.conferma = "1"; t.textContent = "Conferma: svuota la scheda"; return; }
      scheda = nuovaScheda(); salvaBozza(); render(); break;
    case "salva-scheda": {
      const copia = clone(scheda); copia.salvata = new Date().toISOString();
      const i = schede.findIndex((s) => s.id === scheda.id); if (i >= 0) schede[i] = copia; else schede.push(copia);
      store.set("schede", schede); toast("Scheda salvata in archivio"); break; }
    case "apri-scheda": scheda = clone(schede.find((s) => s.id === t.dataset.sid)); salvaBozza(); tab = "scheda"; render(); break;
    case "duplica-scheda": { const s = clone(schede.find((s) => s.id === t.dataset.sid)); s.id = uid(); s.data = oggi(); s.paziente = s.paziente ? s.paziente + " (copia)" : ""; delete s.salvata; scheda = s; salvaBozza(); tab = "scheda"; render(); toast("Copia aperta: modificala e salvala"); break; }
    case "elimina-scheda":
      if (t.dataset.conferma !== "1") { t.dataset.conferma = "1"; t.textContent = "Conferma"; return; }
      schede = schede.filter((s) => s.id !== t.dataset.sid); store.set("schede", schede); render(); break;
    case "anteprima": buildPrint(); document.body.classList.add("preview"); window.scrollTo(0, 0); break;
    case "chiudi-anteprima": document.body.classList.remove("preview"); break;
    case "stampa": stampa(); break;
    case "esporta": esporta(); break;
    case "togli-logo": LOGO = null; await idb.del("logo"); render(); break;
  }
});

document.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.id === "cerca") { cerca = t.value; const pos = t.selectionStart; render(); const n = $("#cerca"); n.focus(); n.setSelectionRange(pos, pos); return; }
  if (t.dataset.cella) { const x = trova(t.dataset.cella); (x.celle[t.dataset.r] = x.celle[t.dataset.r] || [])[+t.dataset.c] = t.value; salvaBozza(); return; }
  if (t.dataset.nota) { trova(t.dataset.nota).nota = t.value; salvaBozza(); return; }
  if (t.dataset.s) { scheda[t.dataset.s] = t.value; salvaBozza(); return; }
  if (t.dataset.set && t.tagName !== "SELECT") { settings[t.dataset.set] = t.type === "number" ? Math.max(1, Math.min(12, +t.value || 4)) : t.value; store.set("settings", settings); if (t.dataset.set === "studio") $("#brand-name").textContent = t.value || "NC Fisioterapia"; }
});

document.addEventListener("change", async (ev) => {
  const t = ev.target;
  if (t.dataset.filtro) { filtri[t.dataset.filtro] = t.value; store.set("filtri", filtri); render(); return; }
  if (t.id === "solo-primario") { solPrimario = t.checked; render(); return; }
  if (t.dataset.per) { trova(t.dataset.per).periodo = t.value; salvaBozza(); render(); return; }
  if (t.dataset.n) { const x = trova(t.dataset.n); x.n = Math.max(1, Math.min(12, +t.value || 1)); salvaBozza(); render(); return; }
  if (t.dataset.set && t.tagName === "SELECT") { settings[t.dataset.set] = t.value; store.set("settings", settings); return; }
  if (t.dataset.setb) { settings[t.dataset.setb] = t.checked; store.set("settings", settings); return; }
  if (t.dataset.foto && t.files[0]) {
    const id = t.dataset.foto, slot = +t.dataset.slot;
    try { const url = await comprimi(t.files[0]); const arr = FOTO[id] ? FOTO[id].slice() : [null, null]; arr[slot] = url; FOTO[id] = arr; await idb.set("foto:" + id, arr); dettaglio(id); render(); toast("Foto salvata"); }
    catch (e) { toast("Non riesco a leggere questa immagine"); }
    return;
  }
  if (t.id === "logo-in" && t.files[0]) { LOGO = await comprimi(t.files[0], 600); await idb.set("logo", LOGO); render(); toast("Logo salvato"); return; }
  if (t.id === "importa" && t.files[0]) { importa(t.files[0]); }
});

document.addEventListener("submit", (ev) => { if (ev.target.id === "form-ed") { ev.preventDefault(); salvaEditor(ev.target); } });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && document.body.classList.contains("preview")) document.body.classList.remove("preview"); });

/* ---------- avvio ---------- */
(async function init() {
  render();
  const all = await idb.all();
  Object.keys(all).forEach((k) => { if (k.startsWith("foto:")) FOTO[k.slice(5)] = all[k]; });
  LOGO = all.logo || null;
  if (Object.keys(FOTO).length || LOGO) render();
})();
})();
