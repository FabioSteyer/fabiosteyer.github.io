# Deployment

## Aktueller Zustand (12.09.2026)

Die Seite ist live unter <https://fabiosteyer.github.io/>.

Ausgeliefert wird **nicht** aus `main`, sondern aus dem Branch **`gh-pages`**, der den fertigen
Build (`dist/`) enthält. GitHub Pages steht auf `build_type: legacy`, Quelle `gh-pages` / `/`.
Eine Datei `.nojekyll` verhindert, dass GitHub die Dateien durch Jekyll schickt.

**Ein Commit auf `main` ändert die Live-Seite nicht.** Nach jeder inhaltlichen Änderung:

```powershell
npm run deploy
```

Das Skript `scripts/deploy-gh-pages.ps1` baut die Seite, legt `.nojekyll` an, schiebt den Build
per Force-Push auf `gh-pages`, räumt die Arbeitskopie wieder weg und stößt den Pages-Build an.
Es bricht bei jedem Fehlschlag ab, statt weiterzulaufen.

Status danach:

```powershell
gh api repos/FabioSteyer/fabiosteyer.github.io/pages/builds/latest
```

## Warum dieser Umweg

`.github/workflows/deploy.yml` ist der eigentlich vorgesehene Weg: Actions baut und veröffentlicht.
Der Lauf vom 12.09.2026 ist nach zwei Sekunden abgebrochen, Fehlermeldung von GitHub:

> The job was not started because your account is locked due to a billing issue.

Die Abrechnungssperre betrifft GitHub-Actions-Läufe. Der klassische Pages-Builder
(`pages build and deployment`) läuft davon unberührt weiter — deshalb funktioniert der Umweg
über den `gh-pages`-Branch.

**Sobald die Abrechnungssperre aufgehoben ist**, ist der Umweg überflüssig:

1. Pages-Quelle zurückstellen: `gh api -X PUT repos/FabioSteyer/fabiosteyer.github.io/pages -f build_type=workflow`
2. Workflow starten: `gh workflow run deploy.yml`
3. Branch `gh-pages` löschen, `scripts/deploy-gh-pages.ps1` und das `deploy`-Skript aus
   `package.json` entfernen, diese Datei löschen und den Hinweis in `deploy.yml` zurücknehmen.
