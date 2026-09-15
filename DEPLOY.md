# Deployment

## Aktueller Zustand (14.09.2026)

Die Seite ist live unter <https://fabiosteyer.github.io/>.

Ausgeliefert wird der Build, den **GitHub Actions** erzeugt. GitHub Pages steht auf
`build_type: workflow`; zuständig ist `.github/workflows/deploy.yml`.

Der Workflow hat **keinen Push-Trigger** — er wird von Hand gestartet:

```powershell
gh workflow run deploy.yml
gh run list --workflow=deploy.yml --limit 1
```

Ein Commit auf `main` allein verändert die Live-Seite also weiterhin nicht. Das ist Absicht:
Es trennt „geschrieben" von „veröffentlicht".

Status prüfen:

```powershell
gh api repos/FabioSteyer/fabiosteyer.github.io/pages
```

## Was vorher war, und warum es sich geändert hat

Zwischen dem 12.09. und dem 14.09.2026 lief Actions nicht. GitHub brach jeden Lauf nach zwei
Sekunden ab:

> The job was not started because your account is locked due to a billing issue.

Ursache war eine fehlgeschlagene Autorisierungsreservierung auf der hinterlegten Zahlungsart
(PayPal) — keine offene Forderung. Solange das galt, wurde die Seite aus dem Branch `gh-pages`
ausgeliefert (`build_type: legacy`), befüllt über `scripts/deploy-gh-pages.ps1`.

**Am 14.09.2026 aufgelöst.** Zahlungsart erneuert, Sperre weg. Belegt dadurch, dass Lauf
`34881022022` tatsächlich 16 Sekunden lang Schritte ausgeführt hat, statt nach zwei Sekunden
abzubrechen.

Dabei kam ein zweiter, davon unabhängiger Fehler zum Vorschein: `withastro/action@v3` startet
per Vorgabe mit **Node 20**, Astro 7.3.2 verlangt laut `package.json` aber `>=22.12.0`. Der
Build brach mit „Node.js v20.20.2 is not supported by Astro!" ab. Behoben durch
`node-version: 22` im Workflow (Commit `2cf8c55`). Der Lauf `34882189100` ist danach grün
durchgelaufen, Build und Deploy.

## Rückfallebene

Branch `gh-pages` und `scripts/deploy-gh-pages.ps1` sind **bewusst erhalten geblieben**. Wenn
Actions erneut klemmt, ist der Rückweg zwei Befehle weit:

```powershell
gh api -X PUT repos/FabioSteyer/fabiosteyer.github.io/pages -f build_type=legacy -f "source[branch]=gh-pages" -f "source[path]=/"
npm run deploy
```

Der Inhalt von `gh-pages` ist ab dem 14.09.2026 nicht mehr automatisch aktuell — `npm run deploy`
baut ihn aber ohnehin neu.

**Zwei Nachträge vom 15.09.2026:**

- `scripts/deploy-gh-pages.ps1` stößt den klassischen Pages-Build **nur noch an, wenn
  `build_type` tatsächlich `legacy` ist**. Vorher tat es das bedingungslos — im jetzigen
  Zustand hätte ein versehentlicher `npm run deploy` die Auslieferung unbemerkt von Actions
  auf `gh-pages` zurückgezogen. Deshalb steht im Rückweg oben das Umstellen **vor** dem Deploy.
- `gh-pages` wurde am 15.09.2026 einmal auf den aktuellen Stand gebracht (Build `2d88f10`),
  damit die Rückfallebene nicht mit einem zwei Stände alten Build dasteht. Das ersetzt die
  offene Entscheidung unten nicht, es entschärft nur ihre Kosten.

**Offene Entscheidung:** Ob `gh-pages`, das Skript und der `deploy`-Eintrag in `package.json`
irgendwann ganz entfallen, ist nicht entschieden. Dafür spricht, dass zwei Wege zum selben Ziel
auseinanderlaufen können. Dagegen spricht, dass der klassische Pages-Builder von
Abrechnungssperren nachweislich nicht betroffen ist und damit die einzige Ebene bleibt, die
unabhängig von Actions funktioniert.
