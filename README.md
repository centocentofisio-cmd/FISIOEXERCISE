# FISIOEXERCISE – Schede esercizi di NC Fisioterapia

Web app statica (HTML + CSS + JavaScript, nessuna installazione) per creare schede esercizi.

- `index.html` – interfaccia e stile (anche il layout di stampa/PDF)
- `esercizi.js` + `esercizi-anca.js` – esercizi dell'anca (`esercizi.js` è il file principale, va caricato per primo); campo facoltativo `metriche` per test e valori di riferimento
- `esercizi-<distretto>.js` – un file per distretto (cervicale, toracico, lombare, spalla, gomito, polso-mano, ginocchio, piede-caviglia, core), ognuno aggiunge i suoi esercizi a `window.ESERCIZI` con un prefisso negli id
- Valori ammessi per i distretti: Cervicale, Toracico, Lombare, Core, Spalla, Gomito, Polso e mano, Anca, Adduttori, Ischiocrurali, Ginocchio, Piede e caviglia
- `manifest.webmanifest`, `sw.js`, `icon-*.png` – app installabile (PWA) e uso offline; aggiungere ogni nuovo file `esercizi-*.js` anche all'elenco `CORE` in `sw.js` e incrementare `CACHE`
- `app.js` – logica: filtri, scheda paziente, tabella di progressione, archivio, backup
- `img/` – foto da free-exercise-db (Unlicense, pubblico dominio)

I dati (schede, foto caricate, logo) restano nel browser del dispositivo. Usa "Archivio > Esporta backup" per salvarli o spostarli.
