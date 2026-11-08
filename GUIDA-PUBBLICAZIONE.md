# Come mettere online l'app (gratis)

L'app è fatta solo di file statici (HTML, JavaScript, immagini): non serve un server né un database. I dati dei pazienti NON vanno online: restano nel browser del dispositivo che usi.

## Strada A – Netlify Drop (5 minuti, consigliata per provare subito)

1. Scarica `schede-esercizi-app.zip` dal progetto e scompattalo sul computer (ottieni una cartella con `index.html`, `app.js`, `esercizi.js`, `img/`).
2. Crea un account gratuito: https://app.netlify.com/signup (puoi entrare con l'account GitHub).
3. Apri https://app.netlify.com/drop
4. Trascina la cartella scompattata nel riquadro.
5. Dopo pochi secondi ottieni un indirizzo tipo `https://nome-casuale.netlify.app`.
6. Facoltativo: Site configuration > Change site name, per esempio `nc-fisioterapia-schede` → `https://nc-fisioterapia-schede.netlify.app`.

Per aggiornare l'app: Deploys > trascina di nuovo la cartella aggiornata.

## Strada B – GitHub Pages (aggiornamenti automatici da Claude)

1. Crea un repository vuoto: https://github.com/new
   - Repository name: `schede-esercizi`
   - Visibilità: **Public** (GitHub Pages gratis richiede repo pubblico con piano Free; nel repo c'è solo il codice e i testi degli esercizi, nessun dato paziente)
   - NON spuntare "Add a README"
2. Scrivi a Claude "repo creato": Claude carica i file e li aggiorna ogni volta che chiedi modifiche.
3. Attiva Pages: https://github.com/centocentofisio-cmd/schede-esercizi/settings/pages
   - Source: **Deploy from a branch**
   - Branch: **main**, cartella **/(root)**, poi **Save**
4. Dopo 1-2 minuti l'app è su: https://centocentofisio-cmd.github.io/schede-esercizi/

Alternativa senza Claude: nel repo vuoto clicca "uploading an existing file" e trascina il contenuto della cartella scompattata, poi "Commit changes".

## Strada A + B insieme (la più comoda nel tempo)
Su Netlify: Add new site > Import an existing project > GitHub > `schede-esercizi`. Ogni modifica che Claude carica su GitHub viene pubblicata da sola su Netlify.

## Uso quotidiano
- Esercizi → filtra → “+ Scheda” → Scheda: compila paziente e tabelle → “Anteprima e PDF” → “Stampa / salva PDF” → nella finestra di stampa scegli “Salva come PDF”.
- Impostazioni: carica il logo NC Fisioterapia, nome, contatti.
- Archivio: salva, duplica le schede; “Esporta backup” ogni tanto (i dati stanno solo in quel browser).
- Da tablet/telefono: apri il link e usa “Aggiungi a schermata Home” per averla come app.
