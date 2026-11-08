# NC Fisioterapia – Schede esercizi

Web app statica (HTML + CSS + JavaScript, nessuna installazione) per creare schede esercizi.

- `index.html` – interfaccia e stile (anche il layout di stampa/PDF)
- `esercizi.js` – database esercizi (distretto pilota: anca)
- `esercizi-cervicale.js` – esercizi del rachide cervicale (33, id con prefisso `cerv-`), caricato dopo `esercizi.js`
- `app.js` – logica: filtri, scheda paziente, tabella di progressione, archivio, backup
- `img/` – foto da free-exercise-db (Unlicense, pubblico dominio)

I dati (schede, foto caricate, logo) restano nel browser del dispositivo. Usa "Archivio > Esporta backup" per salvarli o spostarli.
