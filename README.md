# NC Fisioterapia – Schede esercizi

Web app statica (HTML + CSS + JavaScript, nessuna installazione) per creare schede esercizi.

- `index.html` – interfaccia e stile (anche il layout di stampa/PDF)
- `esercizi.js` – database esercizi dell'anca (file principale, va caricato per primo)
- `esercizi-<distretto>.js` – un file per distretto (cervicale, toracico, lombare, spalla, gomito, polso-mano, ginocchio, piede-caviglia), ognuno aggiunge i suoi esercizi a `window.ESERCIZI` con un prefisso negli id
- Valori ammessi per i distretti: Cervicale, Toracico, Lombare, Core, Spalla, Gomito, Polso e mano, Anca, Adduttori, Ischiocrurali, Ginocchio, Piede e caviglia
- `app.js` – logica: filtri, scheda paziente, tabella di progressione, archivio, backup
- `img/` – foto da free-exercise-db (Unlicense, pubblico dominio)

I dati (schede, foto caricate, logo) restano nel browser del dispositivo. Usa "Archivio > Esporta backup" per salvarli o spostarli.
