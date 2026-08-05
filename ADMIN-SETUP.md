# Admin-Bereich einrichten (GitHub, kein Drittanbieter)

Die Website hat einen passwortgeschützten Admin-Bereich unter `admin/`, über
den du Games, Radtouren und Raya-Fotos direkt im Browser pflegen kannst.
Es gibt dabei **keinen externen Dienst** — Änderungen werden direkt als
Commit in dein eigenes GitHub-Repo geschrieben (dieselbe Datei, die die
Website sowieso schon anzeigt). GitHub Pages baut danach automatisch neu.

Einmalige Einrichtung, dauert ca. 5–10 Minuten.

---

## Wie das funktioniert (kurz)

- Der Admin-Bereich fragt zwei Dinge ab: ein **Passwort** (nur ein
  clientseitiger Türsteher — jeder, der die Seitenquelle liest, könnte ihn
  theoretisch umgehen, das ist bei einer rein statischen Seite ohne Server
  technisch nicht anders lösbar) und einen **GitHub-Zugriffstoken**
  (den echten Schlüssel, der Schreibrechte auf dein Repo gibt).
- Der Token wird **nie im Code gespeichert** — du gibst ihn bei jedem Login
  selbst ein, er landet nur in deinem eigenen Browser (`sessionStorage`
  bzw. optional `localStorage`, wenn du „merken" anhakst) und wird
  ausschließlich direkt an `api.github.com` gesendet.
- Speichern im Admin-Bereich = ein Commit über die GitHub-API in genau die
  Dateien, die du sonst von Hand bearbeitet hättest (`js/gaming-data.js`
  usw.) bzw. neue Bilddateien unter `assets/`.

---

## 1. GitHub-Zugriffstoken erstellen

Am sichersten: ein **Fine-grained Personal Access Token**, beschränkt auf
genau dieses eine Repo.

1. Auf GitHub: **Settings** (dein Profil oben rechts) → **Developer
   settings** → **Personal access tokens** → **Fine-grained tokens** →
   **Generate new token**.
2. **Repository access** → „Only select repositories" → dein
   Website-Repo auswählen.
3. Unter **Permissions** → **Repository permissions** → **Contents** auf
   **„Read and write"** stellen. Mehr Rechte braucht der Admin-Bereich nicht.
4. Ein Ablaufdatum setzen (z.B. 1 Jahr) und **Generate token**.
5. Den angezeigten Token (`github_pat_…`) kopieren — er wird nur einmal
   angezeigt!

> Alternative: ein klassischer Token mit `repo`-Scope funktioniert auch,
> hat aber Zugriff auf **alle** deine Repos — der fine-grained Token oben
> ist deutlich sicherer, weil er nur dieses eine Repo betrifft.

## 2. Admin-Passwort festlegen

Der Admin-Bereich speichert nicht das Passwort selbst, sondern nur dessen
SHA-256-Hash. So erzeugst du ihn:

1. Öffne auf einer beliebigen Seite die Browser-Konsole (F12 → „Konsole").
2. Füge ein (ersetze `DeinPasswort` durch dein echtes Passwort):

   ```js
   crypto.subtle.digest("SHA-256", new TextEncoder().encode("DeinPasswort"))
     .then(buf => console.log([...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("")));
   ```
3. Enter drücken — die Konsole gibt einen langen Hex-String aus. Den
   kopieren.

## 3. Konfigurieren

Trag in [`admin/js/admin-config.js`](admin/js/admin-config.js) ein:

```js
window.GITHUB_REPO = "dein-github-username/dein-repo-name";
window.GITHUB_BRANCH = "main"; // oder "master", je nachdem was dein Repo nutzt
window.ADMIN_PASSWORD_HASH = "der-hex-string-aus-schritt-2";
```

Speichern, committen, pushen — fertig.

---

## 4. Admin-Bereich benutzen

- `admin/index.html` öffnen (bzw. `deine-domain.de/admin/`), Passwort +
  GitHub-Token eingeben. „Token in diesem Browser merken" anhaken, wenn du
  ihn nicht bei jedem Login neu eintippen willst.
- Drei Reiter: **Games**, **Radtouren**, **Raya-Fotos**. Links die
  vorhandenen Einträge, rechts das Formular.
- ✏️ bearbeitet einen Eintrag, 🗑️ löscht ihn (mit Bestätigung).
- Jedes Speichern/Löschen erzeugt einen echten Git-Commit in deinem Repo
  (Nachricht z.B. „Admin: Spiel "Apex Legends" hinzugefügt").
- **Wichtig:** Benutz den Admin-Bereich am besten auf der **live gehosteten
  Seite**, nicht per Doppelklick lokal — die Bildvorschauen in der Liste
  laden direkt von GitHub, das lokale `assets/`-Verzeichnis bekommt neue
  Bilder ja nicht automatisch mit (die landen nur im Repo, nicht auf
  deiner Festplatte). Nach dem Speichern kurz warten (GitHub Pages braucht
  meist unter einer Minute zum Neubauen), dann die Website neu laden.
- Ist dein Repo privat, brauchst du keine zusätzliche Absicherung des
  Admin-Bereichs — schau aber trotzdem, dass niemand deinen Token sieht.

## 5. Aufräumen / Sicherheit

- Token abgelaufen oder verloren? Einfach in GitHub → Developer settings
  → Personal access tokens einen neuen erstellen.
- Token widerrufen: dort auch jederzeit löschbar — sofort ungültig.
- Passwort ändern: neuen Hash erzeugen (Schritt 2) und in
  `admin-config.js` eintragen.
- Gelöschte/ersetzte Bilder bleiben als alte Datei in `assets/` liegen
  (git löscht nichts automatisch) — kannst du bei Bedarf manuell im Repo
  aufräumen.
- Lokal ansehen (`index.html` doppelklicken) funktioniert für die normale
  Website weiterhin ohne alles hier — der Admin-Bereich ist die einzige
  Stelle, die GitHub braucht.
