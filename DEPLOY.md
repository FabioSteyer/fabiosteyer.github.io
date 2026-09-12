# Deployment

## Aktueller Zustand (12.09.2026)

Die Seite ist live unter <https://fabiosteyer.github.io/>.

Ausgeliefert wird **nicht** aus `main`, sondern aus dem Branch **`gh-pages`**, der den fertigen
Build (`dist/`) enthält. GitHub Pages steht auf `build_type: legacy`, Quelle `gh-pages` / `/`.
Eine Datei `.nojekyll` verhindert, dass GitHub die Dateien durch Jekyll schickt.

**Ein Commit auf `main` ändert die Live-Seite nicht.** Nach jeder inhaltlichen Änderung:

```powershell
npm run build
New-Item -ItemType File -Path dist\.nojekyll -Force
git worktree add --orphan -b gh-pages-neu ..\_gh-pages-wt
Copy-Item dist\* ..\_gh-pages-wt -Recurse -Force
Copy-Item dist\.nojekyll ..\_gh-pages-wt -Force
cd ..\_gh-pages-wt; git add -A; git commit -m "Build"; git push -f origin HEAD:gh-pages
cd ..\portfolio-website; git worktree remove ..\_gh-pages-wt --force
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
3. Branch `gh-pages` löschen und diese Datei entfernen.
