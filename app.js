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
  { key: "distretto", label: "Distretto", valori: ["Cervicale", "Toracico", "Lombare", "Core", "Spalla", "Gomito", "Polso e mano", "Anca", "Adduttori", "Ischiocrurali", "Ginocchio", "Piede e caviglia"] },
  { key: "pattern", label: "Pattern di movimento", valori: ["Squat", "Hinge", "Affondo", "Spinta", "Trazione", "Carry", "Rotazione/anti-rotazione", "Anti-estensione", "Salto/atterraggio", "Analitico", "Mobilità"], arr: true },
  { key: "catena", label: "Catena cinetica", valori: ["Aperta", "Chiusa"] },
  { key: "carico", label: "Carico", valori: ["In carico", "In scarico"] },
  { key: "lateralita", label: "Lateralità", valori: ["Bilaterale", "Unilaterale", "Split stance"] },
  { key: "attrezzatura", label: "Attrezzatura", valori: ["Corpo libero", "Manubri", "Kettlebell", "Bilanciere", "Landmine", "Elastico", "Cavo", "Smith", "Leg extension", "Leg curl", "Piccoli attrezzi"], arr: true },
  { key: "regime", label: "Regime di contrazione", valori: ["Isometrico", "Concentrico", "Eccentrico", "Pliometrico"], arr: true },
  { key: "obiettivo", label: "Obiettivo", valori: ["Mobilità", "Controllo motorio", "Forza", "Ipertrofia", "Potenza", "RFD", "Resistenza"], arr: true },
  { key: "fase", label: "Fase riabilitativa", valori: ["Precoce", "Intermedia", "Avanzata", "Ritorno allo sport"], arr: true },
  { key: "specificita", label: "Specificità", valori: ["Generale", "Gesto-specifico"] },
];
// Un valore nuovo presente nei file dati (esercizi-*.js) ma non elencato sopra compare comunque in coda al filtro.
(window.ESERCIZI || []).forEach((e) => FILTRI.forEach((f) => {
  const v = f.key === "distretto" ? [e.primario].concat(e.secondari || []) : [].concat(e[f.key] || []);
  v.forEach((x) => { if (x && !f.valori.includes(x)) f.valori.push(x); });
}));
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
let installEvt = null;

/* ---------- professionisti (più nomi sullo stesso dispositivo) ---------- */
let professionisti = store.get("professionisti", null);
if (!Array.isArray(professionisti)) {
  // Prima apertura con questa funzione: il vecchio campo "Fisioterapista" diventa il primo profilo.
  professionisti = settings.terapista && settings.terapista.trim() ? [{ id: uid(), nome: settings.terapista.trim() }] : [];
  store.set("professionisti", professionisti);
}
let profAttivo = store.get("profAttivo", null);
if (!professionisti.some((p) => p.id === profAttivo)) profAttivo = professionisti.length === 1 ? professionisti[0].id : null;
let obbligaProf = false; // true finché nessun professionista è stato scelto: la finestra non si può chiudere
const profCorrente = () => professionisti.find((p) => p.id === profAttivo) || null;
const nomeProf = () => (profCorrente() ? profCorrente().nome : "");
function salvaProf() { store.set("professionisti", professionisti); store.set("profAttivo", profAttivo); }
function aggiornaProfBtn() {
  let b = $("#prof-btn");
  if (!b) {
    const brand = $(".brand"); if (!brand) return;
    b = document.createElement("button"); b.id = "prof-btn"; b.className = "btn sm"; b.dataset.act = "scegli-prof";
    b.title = "Cambia professionista"; brand.insertAdjacentElement("afterend", b);
  }
  const n = nomeProf();
  b.textContent = n ? "👤 " + n : "👤 Scegli professionista";
  b.setAttribute("aria-label", n ? "Professionista attivo: " + n + ". Cambia professionista" : "Scegli professionista");
}
function sceltaProf() {
  obbligaProf = !profCorrente();
  openDlg(`<div class="dlg-h"><div><h2>Chi sta usando FISIOEXERCISE?</h2><div class="alias">Il nome scelto compare nell'intestazione della scheda stampata.</div></div>
      ${obbligaProf ? "" : `<button class="btn ghost sm x" data-act="chiudi" aria-label="Chiudi">✕</button>`}</div>
    <div class="dlg-b">
      ${professionisti.length ? `<div class="list">${professionisti.map((p) => `<div class="li"><div class="t"><b>${esc(p.nome)}</b>${p.id === profAttivo ? `<span>Attivo ora</span>` : ""}</div>
        <button class="btn sm ${p.id === profAttivo ? "" : "primary"}" data-act="usa-prof" data-pid="${p.id}">${p.id === profAttivo ? "Continua" : "Entra"}</button></div>`).join("")}</div>`
        : `<p class="note" style="margin:0">Nessun professionista salvato su questo dispositivo. Inserisci il tuo nome per iniziare.</p>`}
      <form id="form-prof" class="row" autocomplete="off">
        <label class="field" style="flex:1;min-width:220px"><span>Nuovo professionista</span><input type="text" name="nome" id="prof-nuovo" placeholder="Dott. Nome Cognome, Fisioterapista" maxlength="80"></label>
        <button class="btn primary" type="submit" style="align-self:flex-end">Aggiungi ed entra</button>
      </form>
      <p class="note" style="margin:0">I nomi restano salvati solo in questo browser. Puoi rinominarli o eliminarli da Impostazioni.</p>
    </div>`);
  if (!professionisti.length) setTimeout(() => { const i = $("#prof-nuovo"); if (i) i.focus(); }, 50);
}
function entraProf(id) {
  profAttivo = id; obbligaProf = false; salvaProf(); closeDlg(); aggiornaProfBtn(); render();
  toast("Professionista attivo: " + nomeProf());
}

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
  aggiornaProfBtn();
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
      ${lst("Metriche e test di riferimento", e.metriche)}
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

/* ---------- obiettivo del lavoro (calcolato dalla prescrizione) ----------
   Soglie dal continuum delle ripetizioni: Haff & Triplett, NSCA Essentials 4ª ed. 2016;
   ACSM Position Stand, Med Sci Sports Exerc 2009;41:687-708; Schoenfeld BJ, Grgic J et al., Sports 2021;9(2):32.
   Pliometria: ciclo stiramento-accorciamento (SSC), Komi PV, J Biomech 2000;33:1197-206. */
const OBIETTIVI = {
  forza: { label: "Forza", cls: "o-forza" },
  potenza: { label: "Potenza", cls: "o-potenza" },
  ipertrofia: { label: "Ipertrofia", cls: "o-ipertrofia" },
  capacita: { label: "Capacità di carico", cls: "o-capacita" },
  plio: { label: "Pliometria (SSC)", cls: "o-plio" },
  prop: { label: "Propedeutica pliometria", cls: "o-prop" },
  mob: { label: "Mobilità", cls: "o-mob" },
};
function leggiPrescrizione(x, c) {
  const cel = (k) => String(((x.celle[k] || [])[c]) || "");
  const serie = cel("serie"), carico = cel("carico"), rpeT = cel("rpe"), tempo = cel("tempo"), note = cel("note") + " " + (x.nota || "");
  const out = { serie, testo: [serie, carico, rpeT, tempo, note].join(" ").toLowerCase() };
  const m = serie.match(/(\d+)\s*[x×*]\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*(s\b|sec|"|min|')?/i);
  if (m) { out.reps = m[3] ? (+m[2] + +m[3]) / 2 : +m[2]; if (m[4]) { out.durata = /min|'/.test(m[4]) ? out.reps * 60 : out.reps; out.reps = null; } }
  else { const d = serie.match(/(\d+)\s*(s\b|sec|"|min|')/i); if (d) out.durata = /min|'/.test(d[2]) ? +d[1] * 60 : +d[1]; else { const r = serie.match(/^\s*(\d+)\s*(rip|$)/i); if (r) out.reps = +r[1]; } }
  const rpe = rpeT.match(/rpe\s*(\d+(?:[.,]\d)?)/i), rir = rpeT.match(/rir\s*(\d+)/i);
  if (rpe) out.rpe = parseFloat(rpe[1].replace(",", ".")); else if (rir) out.rpe = 10 - +rir[1]; else { const n = rpeT.match(/^\s*(\d+(?:[.,]\d)?)\s*$/); if (n) out.rpe = parseFloat(n[1].replace(",", ".")); }
  const pct = carico.match(/(\d+)\s*%/); if (pct) out.pct = +pct[1];
  out.esplosivo = /x/i.test(tempo) || /esplosiv|massima velocit|veloc|balistic|potenza/.test(out.testo);
  return out;
}
function obiettivoCol(e, x, c) {
  const p = leggiPrescrizione(x, c);
  if (!p.serie.trim()) return null;
  const pat = e.pattern || [], reg = e.regime || [], ob = e.obiettivo || [];
  if (pat.includes("Mobilità") || (ob.length === 1 && ob[0] === "Mobilità")) return "mob";
  if (pat.includes("Salto/atterraggio") || reg.includes("Pliometrico")) {
    const nomeTxt = [e.nome, e.alias].join(" ").toLowerCase();
    const senzaSSC = /stick|stabilizz|atterragg|landing|snap.?down|da seduto|seated|senza contromovimento/.test(nomeTxt + " " + p.testo);
    const conSSC = /rimbalz|continu|reattiv|pogo|depth|drop jump|hop/.test(nomeTxt + " " + p.testo);
    if (!reg.includes("Pliometrico") || (senzaSSC && !conSSC)) return "prop";
    return "plio";
  }
  if (p.durata != null) return p.durata <= 10 && p.rpe >= 8 ? "forza" : "capacita";
  if (p.reps == null) return null;
  const potente = p.esplosivo || (p.pct && p.pct <= 80 && (ob.includes("Potenza") || ob.includes("RFD"))) || ((ob.includes("Potenza") || ob.includes("RFD")) && !p.rpe && !p.pct);
  if (p.reps <= 6 && potente) return "potenza";
  if (p.reps <= 6) return "forza";
  if (p.reps < 12) return "ipertrofia";
  return "capacita";
}
function obiettiviEsercizio(e, x) {
  const v = []; for (let c = 0; c < x.n; c++) { const o = obiettivoCol(e, x, c); if (o && v[v.length - 1] !== o) v.push(o); } return v;
}
const chipOb = (k) => `<span class="ob ${OBIETTIVI[k].cls}">${OBIETTIVI[k].label}</span>`;
function badgeOb(e, x) { const v = obiettiviEsercizio(e, x); return v.length ? v.map(chipOb).join('<span class="ob-arrow">→</span>') : `<span class="ob-vuoto">Compila serie × ripetizioni per vedere l'obiettivo</span>`; }
function aggiornaObiettivi(uidX) {
  const x = trova(uidX); const e = x && byId(x.exId); if (!e) return;
  const b = document.getElementById("ob-" + uidX); if (b) b.innerHTML = badgeOb(e, x);
  for (let c = 0; c < x.n; c++) { const td = document.getElementById(`obc-${uidX}-${c}`); if (td) { const o = obiettivoCol(e, x, c); td.innerHTML = o ? chipOb(o) : ""; } }
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
          <div class="ob-row" id="ob-${x.uid}" aria-live="polite">${badgeOb(e, x)}</div>
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
        <tr class="ob-tr"><th>Obiettivo (automatico)</th>${cols.map((_, c) => { const o = obiettivoCol(e, x, c); return `<td id="obc-${x.uid}-${c}">${o ? chipOb(o) : ""}</td>`; }).join("")}</tr>
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
      <label class="field"><span>Titolo della scheda (usato anche nel nome del PDF)</span><input type="text" id="s-titolo" data-s="titolo" value="${esc(s.titolo)}" placeholder="Es. Tendinopatia glutea – fase 2"></label>
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
    <div><h3>Obiettivo del lavoro</h3>
    <table><tr><th>Obiettivo</th><th>Come viene riconosciuto</th></tr>
      <tr><td>${chipOb("forza")}</td><td>≤ 6 ripetizioni (tipicamente 1–5 a RPE ≥ 8 / ≥ 85% 1RM), oppure isometria ≤ 10 s a RPE ≥ 8</td></tr>
      <tr><td>${chipOb("potenza")}</td><td>≤ 6 ripetizioni eseguite alla massima velocità (tempo con X, carichi ≤ 80% 1RM) o esercizi balistici</td></tr>
      <tr><td>${chipOb("ipertrofia")}</td><td>7–11 ripetizioni vicino al cedimento (RIR 0–3)</td></tr>
      <tr><td>${chipOb("capacita")}</td><td>≥ 12 ripetizioni o isometrie/tenute a tempo: tolleranza al carico e resistenza muscolare</td></tr>
      <tr><td>${chipOb("plio")}</td><td>Salti con ciclo stiramento-accorciamento (contromovimento, rimbalzo, contatti reattivi)</td></tr>
      <tr><td>${chipOb("prop")}</td><td>Salti e atterraggi senza SSC (atterraggio stabilizzato, salto da fermo/seduto)</td></tr>
      <tr><td>${chipOb("mob")}</td><td>Esercizi di mobilità</td></tr></table>
    <p class="${cls === "legend" ? "note" : ""}" style="margin:4px 0 0">Haff GG, Triplett NT. NSCA Essentials of Strength Training and Conditioning, 4ª ed. 2016 · ACSM Position Stand. Med Sci Sports Exerc 2009;41:687-708 · Schoenfeld BJ, Grgic J et al. Sports 2021;9(2):32 · Komi PV. J Biomech 2000;33:1197-206</p></div>
    <div><h3>Tempo esecutivo</h3><p style="margin:0">Quattro cifre in secondi: <b>eccentrica – pausa in basso – concentrica – pausa in alto</b>. Es. 3-1-1-0 = scendi in 3 s, fermati 1 s, sali in 1 s, riparti subito. X = il più veloce possibile.</p></div>
  </div>`;
}

function viewArchivio() {
  const l = schede.slice().sort((a, b) => (b.salvata || "").localeCompare(a.salvata || ""));
  return `<div class="sheet-bar"><h1>Archivio schede</h1>
      <button class="btn" data-act="esporta">Esporta backup</button>
      <label class="btn">Importa backup<input type="file" accept="application/json,.json" hidden id="importa"></label></div>
    ${l.length ? `<div class="list">${l.map((s) => `<div class="li"><div class="t"><b>${esc(s.paziente || "Senza nome")}${s.titolo ? " · " + esc(s.titolo) : ""}</b><span>${fmtData(s.data)} · ${s.esercizi.length} esercizi${s.professionista ? " · " + esc(s.professionista) : ""}</span></div>
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
      <p class="note" style="margin:0">Il nome del fisioterapista nell'intestazione è quello del professionista attivo (vedi sotto).</p>
      <label class="field"><span>Contatti (una riga per voce)</span><textarea id="set-contatti" data-set="contatti" placeholder="Via…, Città&#10;Tel. …&#10;email@…">${esc(settings.contatti)}</textarea></label>
      <div class="row">${LOGO ? `<img class="logo-prev" src="${LOGO}" alt="Logo">` : `<span class="note">Nessun logo caricato: nel PDF compare il nome dello studio.</span>`}
        <label class="btn sm">Carica logo<input type="file" accept="image/*" hidden id="logo-in"></label>
        ${LOGO ? `<button class="btn sm danger" data-act="togli-logo">Rimuovi logo</button>` : ""}</div>
    </div>
    <div class="panel"><h3>Professionisti</h3>
      ${professionisti.length ? `<div class="list">${professionisti.map((p) => `<div class="li"><div class="t" style="flex:1;min-width:200px">
          <label class="field"><span>${p.id === profAttivo ? "Attivo ora" : "Nome"}</span><input type="text" data-prof-nome="${p.id}" value="${esc(p.nome)}" maxlength="80"></label></div>
        ${p.id === profAttivo ? "" : `<button class="btn sm" data-act="usa-prof" data-pid="${p.id}">Usa questo</button>`}
        <button class="btn sm danger" data-act="elimina-prof" data-pid="${p.id}">Elimina</button></div>`).join("")}</div>` : ""}
      <div class="row"><button class="btn sm primary" data-act="scegli-prof">Cambia o aggiungi professionista</button></div>
      <p class="note" style="margin:0">Ogni professionista entra con il proprio nome; nella scheda stampata compare solo il nome del professionista attivo. Schede, foto ed esercizi restano condivisi su questo dispositivo.</p>
    </div>
    <div class="panel"><h3>Contenuto della scheda stampata</h3>
      <label class="chk"><input type="checkbox" id="set-descr" data-setb="stampaDescr" ${settings.stampaDescr ? "checked" : ""}> Stampa la descrizione tecnica</label>
      <label class="chk"><input type="checkbox" id="set-err" data-setb="stampaErrori" ${settings.stampaErrori ? "checked" : ""}> Stampa anche gli errori frequenti</label>
      <div class="row"><label class="field"><span>Progressione predefinita</span><select id="set-per" data-set="periodo"><option ${settings.periodo === "Settimane" ? "selected" : ""}>Settimane</option><option ${settings.periodo === "Mesi" ? "selected" : ""}>Mesi</option></select></label>
      <label class="field"><span>Colonne predefinite</span><input type="number" id="set-n" min="1" max="12" data-set="n" value="${settings.n}"></label></div>
    </div>
    <div class="panel"><h3>Installa FISIOEXERCISE</h3>
      ${installEvt ? `<div class="row"><button class="btn primary" data-act="installa">Installa app su questo dispositivo</button></div>` : ""}
      <p class="note" style="margin:0"><b>Android / tablet (Chrome):</b> menu ⋮ › <i>Installa app</i> oppure <i>Aggiungi a schermata Home</i>.<br>
      <b>iPhone / iPad (Safari):</b> pulsante Condividi › <i>Aggiungi alla schermata Home</i>.<br>
      <b>Computer (Chrome o Edge):</b> icona di installazione a destra nella barra degli indirizzi.<br>
      Una volta installata si apre come un'app e funziona anche senza internet (le foto vengono salvate al primo avvio).</p>
      <p class="note" style="margin:0"><b>Pacchetto da scaricare:</b> github.com/centocentofisio-cmd/FISIOEXERCISE/archive/refs/heads/main.zip. Scompatta e apri <code>index.html</code> nel browser. Le schede salvate restano separate da quelle della versione online: spostale con Esporta/Importa backup.</p>
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
      ${obiettiviEsercizio(e, x).length ? `<div class="ob-row">${badgeOb(e, x)}</div>` : ""}
      <div class="pr-body">
        <div class="pr-imgs ${im && im.length > 1 ? "" : "one"}">${im ? im.map((src) => `<img src="${esc(src)}" alt="">`).join("") : placeholder(e)}</div>
        <div>
          ${settings.stampaDescr ? `<p>${esc(e.descrizione)}</p>` : ""}
          ${e.cue && e.cue.length ? `<h4>Come eseguirlo</h4><ul>${e.cue.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
          ${settings.stampaErrori && e.errori && e.errori.length ? `<h4>Da evitare</h4><ul>${e.errori.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
      ${righe.length ? `<table class="pr-tab"><thead><tr><th></th>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${righe.map((r) => `<tr><th>${esc(r.label.split(" (")[0])}</th>${cols.map((_, c) => `<td>${esc(((x.celle[r.key] || [])[c]) || "")}</td>`).join("")}</tr>`).join("")}${obiettiviEsercizio(e, x).length ? `<tr><th>Obiettivo</th>${cols.map((_, c) => { const o = obiettivoCol(e, x, c); return `<td>${o ? chipOb(o) : ""}</td>`; }).join("")}</tr>` : ""}</tbody></table>` : ""}
      ${x.nota ? `<div class="pr-exnote">${esc(x.nota)}</div>` : ""}
    </section>`;
  }).join("");
  const usaRpe = s.esercizi.some((x) => x.righe.rpe || x.righe.tempo || (byId(x.exId) && obiettiviEsercizio(byId(x.exId), x).length));
  $("#print-root").innerHTML = `<div class="pr">
    <div class="pr-head"><div class="pr-logo">${LOGO ? `<img src="${LOGO}" alt="${esc(settings.studio)}">` : `<div class="txt">${esc(settings.studio)}</div>`}</div>
      <div class="pr-studio">${nomeProf() ? `<b>${esc(nomeProf())}</b>` : ""}</div></div>
    <div class="pr-paz"><div><span>Paziente</span><b>${esc(s.paziente || "–")}</b></div><div><span>Data</span><b>${fmtData(s.data)}</b></div>
      ${s.titolo ? `<div style="grid-column:1/-1"><span>Obiettivo</span><b>${esc(s.titolo)}</b></div>` : ""}</div>
    ${s.note ? `<div class="pr-note">${esc(s.note)}</div>` : ""}
    ${ex}
    ${usaRpe ? legendaHTML("pr-legend") : ""}
    <div class="pr-foot">${esc(settings.studio)}${settings.contatti ? " · " + esc(lines(settings.contatti).join(" · ")) : ""} · Scheda personale, da eseguire secondo le indicazioni del fisioterapista.</div>
  </div>`;
}
function stampa() {
  buildPrint(); document.title = titoloPdf();
  if (inFrame) toast("In questa anteprima la stampa è bloccata: usa la versione pubblicata su Netlify o GitHub Pages");
  setTimeout(() => window.print(), 50);
}
// Titolo del PDF (= nome file proposto dal browser): "Paziente - Titolo scheda"
const TITOLO_APP = document.title;
function titoloPdf() {
  const t = [scheda.paziente, scheda.titolo].map((x) => String(x || "").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean).join(" - ");
  return t || "Scheda esercizi " + fmtData(scheda.data).replace(/\//g, "-");
}
window.addEventListener("beforeprint", () => { buildPrint(); document.title = titoloPdf(); });
window.addEventListener("afterprint", () => { document.title = TITOLO_APP; });

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
  const data = { app: "ncf-schede", versione: 1, esportato: new Date().toISOString(), custom, settings, schede, bozza: scheda, foto, logo: LOGO, professionisti };
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
    if (Array.isArray(d.professionisti)) {
      d.professionisti.forEach((p) => { if (p && p.nome && !professionisti.some((q) => q.nome.toLowerCase() === String(p.nome).toLowerCase())) professionisti.push({ id: p.id || uid(), nome: String(p.nome) }); });
      salvaProf();
    }
    for (const k of Object.keys(d.foto || {})) { FOTO[k] = d.foto[k]; await idb.set("foto:" + k, d.foto[k]); }
    if (d.logo) { LOGO = d.logo; await idb.set("logo", d.logo); }
    render(); toast("Backup importato");
  } catch (e) { toast("Il file non è un backup valido di questa app"); }
}

/* ---------- eventi ---------- */
function trova(uidX) { return scheda.esercizi.find((x) => x.uid === uidX); }

document.addEventListener("click", async (ev) => {
  const t = ev.target.closest("[data-tab],[data-tab-go],[data-act],[data-riga]");
  if (!t) { if (ev.target === $("#dlg") && !obbligaProf) closeDlg(); return; }
  if (t.dataset.tab || t.dataset.tabGo) { tab = t.dataset.tab || t.dataset.tabGo; render(); window.scrollTo(0, 0); return; }
  if (t.dataset.riga) { const x = trova(t.dataset.uid); x.righe[t.dataset.riga] = !x.righe[t.dataset.riga]; salvaBozza(); render(); return; }
  const id = t.dataset.id, a = t.dataset.act;
  switch (a) {
    case "apri": dettaglio(id); break;
    case "chiudi": if (!obbligaProf) closeDlg(); break;
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
      const copia = clone(scheda); copia.salvata = new Date().toISOString(); if (nomeProf()) copia.professionista = nomeProf();
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
    case "installa":
      if (!installEvt) { toast("Usa il menu del browser: Installa app / Aggiungi a schermata Home"); break; }
      installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; $("#installa").hidden = true; render(); }); break;
    case "togli-logo": LOGO = null; await idb.del("logo"); render(); break;
    case "scegli-prof": sceltaProf(); break;
    case "usa-prof": entraProf(t.dataset.pid); break;
    case "elimina-prof": {
      if (t.dataset.conferma !== "1") { t.dataset.conferma = "1"; t.textContent = "Conferma eliminazione"; return; }
      professionisti = professionisti.filter((p) => p.id !== t.dataset.pid);
      if (profAttivo === t.dataset.pid) profAttivo = null;
      salvaProf(); render(); if (!profCorrente()) sceltaProf(); break; }
  }
});

document.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.id === "cerca") { cerca = t.value; const pos = t.selectionStart; render(); const n = $("#cerca"); n.focus(); n.setSelectionRange(pos, pos); return; }
  if (t.dataset.cella) { const x = trova(t.dataset.cella); (x.celle[t.dataset.r] = x.celle[t.dataset.r] || [])[+t.dataset.c] = t.value; salvaBozza(); aggiornaObiettivi(t.dataset.cella); return; }
  if (t.dataset.nota) { trova(t.dataset.nota).nota = t.value; salvaBozza(); aggiornaObiettivi(t.dataset.nota); return; }
  if (t.dataset.s) { scheda[t.dataset.s] = t.value; salvaBozza(); return; }
  if (t.dataset.profNome) { const p = professionisti.find((q) => q.id === t.dataset.profNome); if (p && t.value.trim()) { p.nome = t.value.trim(); salvaProf(); aggiornaProfBtn(); } return; }
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

document.addEventListener("submit", (ev) => {
  if (ev.target.id === "form-ed") { ev.preventDefault(); salvaEditor(ev.target); }
  if (ev.target.id === "form-prof") {
    ev.preventDefault();
    const nome = (new FormData(ev.target).get("nome") || "").toString().trim();
    if (!nome) { toast("Inserisci il nome del professionista"); return; }
    let p = professionisti.find((q) => q.nome.toLowerCase() === nome.toLowerCase());
    if (!p) { p = { id: uid(), nome }; professionisti.push(p); }
    entraProf(p.id);
  }
});
// Esc non chiude la finestra di scelta finché non c'è un professionista attivo
$("#dlg").addEventListener("cancel", (ev) => { if (obbligaProf) ev.preventDefault(); });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && document.body.classList.contains("preview")) document.body.classList.remove("preview"); });

/* ---------- app installabile (PWA) ---------- */
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; const b = $("#installa"); if (b) b.hidden = false; });
window.addEventListener("appinstalled", () => { installEvt = null; const b = $("#installa"); if (b) b.hidden = true; toast("FISIOEXERCISE installata"); });
if ("serviceWorker" in navigator && !inFrame && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready).then((reg) => {
      const urls = []; window.ESERCIZI.forEach((e) => { if (e.img) urls.push("img/" + e.img + "/0.jpg", "img/" + e.img + "/1.jpg"); });
      if (reg.active) reg.active.postMessage({ tipo: "precache", urls });
    }).catch(() => {});
  });
}

/* ---------- avvio ---------- */
(async function init() {
  render();
  if (professionisti.length !== 1) sceltaProf(); // con 0 o più profili si sceglie chi entra; con uno solo si entra direttamente
  const all = await idb.all();
  Object.keys(all).forEach((k) => { if (k.startsWith("foto:")) FOTO[k.slice(5)] = all[k]; });
  LOGO = all.logo || null;
  if (Object.keys(FOTO).length || LOGO) render();
})();
})();
