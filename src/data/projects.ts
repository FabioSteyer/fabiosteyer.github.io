export interface ProjectText {
  title: string;
  problem: string;
  approach: string;
  result: string;
  notShown: string;
}

export interface Project {
  repo: string;
  url: string;
  stackDe: string;
  stackEn: string;
  eyebrow: string;
  statValue: string;
  statDe: string;
  statEn: string;
  de: ProjectText;
  en: ProjectText;
}

export const projects: Project[] = [
  {
    repo: 'invoice-quote-reconciliation',
    url: 'https://github.com/FabioSteyer/invoice-quote-reconciliation',
    stackDe: 'Python · pdfplumber · reportlab',
    stackEn: 'Python · pdfplumber · reportlab',
    eyebrow: 'PYTHON · PDFPLUMBER · PYTEST',
    statValue: '4 / 4',
    statDe: 'Abweichungen erkannt. Keine Fehlalarme.',
    statEn: 'Deviations detected. No false alarms.',
    de: {
      title: 'Rechnungen gegen Angebote prüfen',
      problem:
        'Ein Lieferant schickt ein Angebot und rechnet später dagegen ab. Ob die Rechnung dem entspricht, was vereinbart war, prüft bei dreistelligen Positionszahlen niemand Zeile für Zeile.',
      approach:
        'Beide Dokumente werden aus PDF ausgelesen, die Positionen einander zugeordnet und jede Abweichung mit ihrer Auswirkung in Euro gemeldet. Ein Generator erzeugt die Testbelege selbst und protokolliert, welche Abweichungen er eingebaut hat. Dadurch lässt sich die Erkennungsleistung messen statt behaupten.',
      result:
        '4 von 4 eingebauten Abweichungen erkannt, 0 Fehlalarme, 20 Tests. Drei der sieben Testfälle enthalten bewusst keine Abweichung: Ein Einheitenwechsel und eine Teillieferung über zwei Rechnungen sind keine Fehler. Ein Prüfer, der sie meldet, wird nach zwei Wochen nicht mehr gelesen.',
      notShown:
        'Keine echten Lieferantenbelege. Die erzeugten PDFs sind aufgeräumter als die Wirklichkeit. Kein OCR für Scans, keine proprietären Händlerformate, keine ERP-Anbindung.',
    },
    en: {
      title: 'Reconciling invoices against quotes',
      problem:
        'A supplier sends a quote and later invoices against it. Whether the invoice matches what was agreed is something nobody checks line by line once a document runs to three digits of positions.',
      approach:
        'Both documents are read out of PDF, positions are matched, and every deviation is reported with its effect in euro. A generator writes the test documents itself and records which deviations it planted, which makes detection measurable rather than merely plausible.',
      result:
        '4 of 4 planted deviations detected, 0 false alarms, 20 tests. Three of the seven cases contain no deviation on purpose: a change of unit and a partial delivery across two invoices are not errors. A checker that reports them stops being read after two weeks.',
      notShown:
        'No real supplier documents. The generated PDFs are tidier than reality. No OCR for scans, no proprietary wholesaler formats, no ERP integration.',
    },
  },
  {
    repo: 'concurrent-file-writes',
    url: 'https://github.com/FabioSteyer/concurrent-file-writes',
    stackDe: 'Python · nur Standardbibliothek',
    stackEn: 'Python · standard library only',
    eyebrow: 'PYTHON · STANDARD LIBRARY',
    statValue: '14 → 0',
    statDe: 'Verlorene Einträge im dokumentierten Vergleichslauf.',
    statEn: 'Lost entries in the documented comparison run.',
    de: {
      title: 'Gleichzeitige Schreibzugriffe ohne Server koordinieren',
      problem:
        'Mehrere Prozesse arbeiten am selben Dateibaum. Es gibt nur Dateien, keinen Datenbankserver, der Sperren vergibt. Ohne Absprache überschreibt der langsamere Prozess stillschweigend, was der schnellere gerade gespeichert hat.',
      approach:
        'Wer schreiben will, deklariert vorab die Dateien samt der Hashes, die er vorgefunden hat, und holt eine globale Freigabe. Nach dem Schreiben prüft der Koordinator, ob ausschließlich deklarierte Dateien verändert wurden, und schreibt Vorher- und Nachher-Hash in ein Journal. Eine Lücke in dieser Kette beweist, dass jemand außerhalb des Verfahrens geschrieben hat.',
      result:
        'Derselbe Arbeitsauftrag, vier Prozesse, zwanzig erwartete Schreibvorgänge: ohne Koordination 14 verloren und 18 Kettenlücken, mit Koordination 0 und 0. Kein Lauf meldet dabei einen Fehler. Genau das macht diese Fehlerklasse teuer. 18 Tests.',
      notShown:
        'Kein verteiltes System: ein Rechner, ein Dateisystem. Kein Lock-Manager: Eine globale Freigabe serialisiert alles, was bei seltenen Schreibvorgängen richtig und bei vielen falsch ist. Die Prüfung auf undeklarierte Änderungen hasht den ganzen Baum und skaliert nicht auf Hunderttausende Dateien.',
    },
    en: {
      title: 'Coordinating concurrent writes without a server',
      problem:
        'Several processes work on the same file tree. There is no database server handing out locks. There are only files. Without an agreement, the slower process silently overwrites what the faster one just saved.',
      approach:
        'Before writing, a process declares the files it intends to change together with the hashes it saw, and acquires a global lease. After the write the coordinator verifies that only declared files changed and appends the before and after hash to a journal. A gap in that chain proves somebody wrote outside the protocol.',
      result:
        'Same work, four processes, twenty writes expected: without coordination 14 lost and 18 chain gaps, with coordination 0 and 0. Neither run reports an error. That is exactly what makes this class of bug expensive. 18 tests.',
      notShown:
        'Not a distributed system: one machine, one filesystem. Not a lock manager: a single global lease serialises everything, which is right when writes are rare and wrong when they are not. Detecting undeclared changes hashes the whole tree and does not scale to hundreds of thousands of files.',
    },
  },
  {
    repo: 'prose-check-chain',
    url: 'https://github.com/FabioSteyer/prose-check-chain',
    stackDe: 'Python · nur Standardbibliothek',
    stackEn: 'Python · standard library only',
    eyebrow: 'PYTHON · REGEX · STANDARD LIBRARY',
    statValue: '36 / 36',
    statDe: 'Erwartete Befunde im Korpus gefunden. Keine Fehlalarme.',
    statEn: 'Expected findings in the corpus raised. No false alarms.',
    de: {
      title: 'Musterhafte Sätze finden und ersetzen lassen',
      problem:
        'Ein Anschreiben, das nach Schablone klingt, wird überflogen. Die Konstruktionen, die diesen Eindruck erzeugen, sind wenige und regelmäßig. Der Gedankenstrich mitten im Satz, „nicht X, sondern Y", die Floskeln, drei kurze Wörter in Reihe, fünf gleich lange Sätze.',
      approach:
        'Ein deterministischer Linter findet diese Konstruktionen mit regulären Ausdrücken und zwei Satzstatistiken. Dahinter steht eine Kette. Der Text und die Befunde gehen an zwei Prüfer, einen ohne jede Vorkenntnis und ein Modell eines anderen Herstellers. Jeder Vorschlag wird einzeln angewendet und nur behalten, wenn der Linter danach nicht mehr harte Befunde zählt als vorher. Die Modelle haben nie das letzte Wort.',
      result:
        '17 Regeln für Deutsch und Englisch, geprüft an einem Korpus aus 50 erfundenen Sätzen mit 18 sauberen Fallen: 36 von 36 erwarteten Befunden gefunden, 0 Fehlalarme, 29 Tests. Der englische Beispielbrief geht durch die Kette von 6 harten Befunden auf 0. Der deutsche behält eine Warnung, weil die Umschreibungen alle Sätze gleich lang gemacht haben. Das steht so in der Ausgabe.',
      notShown:
        'Kein Detektor für maschinell geschriebene Texte, und keiner wird durch Umkehrung daraus. Die Regelliste ist meine eigene, ohne Literaturgrundlage. Die mitgelieferten Prüferantworten sind gekennzeichnete Stand-ins, keine aufgezeichneten Modellantworten; echte Läufe brauchen zwei API-Schlüssel.',
    },
    en: {
      title: 'Finding formulaic sentences and having them rewritten',
      problem:
        'A cover letter that reads as formulaic gets skimmed. The constructions that create that impression are few and regular. The dash mid-sentence, "not X, but Y", the stock phrases, three short words in a row, five sentences of the same length.',
      approach:
        'A deterministic linter finds those constructions with regular expressions and two sentence statistics. Behind it sits a chain. The text and the findings go to two reviewers, one with no prior knowledge and a model from a different vendor. Each suggestion is applied on its own and kept only if the linter, run again, counts no more hard findings than before. The models never get the last word.',
      result:
        '17 rules for German and English, checked against a corpus of 50 invented sentences with 18 clean traps: 36 of 36 expected findings raised, 0 false alarms, 29 tests. The English example letter goes through the chain from 6 hard findings to 0. The German one keeps one warning because the rewrites made every sentence the same length. The output says so.',
      notShown:
        'Not a detector for machine-written text, and it does not become one by inversion. The rule list is my own, with no basis in the literature. The shipped reviewer answers are labelled stand-ins and were not recorded from a model; real runs need two API keys.',
    },
  },
  {
    repo: 'gated-routine-runner',
    url: 'https://github.com/FabioSteyer/gated-routine-runner',
    stackDe: 'Python · nur Standardbibliothek',
    stackEn: 'Python · standard library only',
    eyebrow: 'PYTHON · STANDARD LIBRARY · THREADS',
    statValue: '8 → 0',
    statDe: 'Irreversible Aktionen ohne Freigabe im Vergleichslauf.',
    statEn: 'Irreversible actions without approval in the comparison run.',
    de: {
      title: 'Routinen auf einem Ordnerbaum, mit Freigabe vor dem Unumkehrbaren',
      problem:
        'Eine kleine Organisation hält ihre Arbeit in Ordnern. Menschen arbeiten in Sitzungen, Routinen laufen unbeaufsichtigt nach Zeitplan. Ohne Protokoll landen zwei Schreiber im selben Projekt, eine Routine verschickt oder löscht, weil die Aufgabe es sagte, und was ein Lauf herausfindet, sieht die nächste Person nie.',
      approach:
        'Jeder Lauf nimmt ein Projekt nach dem anderen in Besitz; belegte werden übersprungen, abgelaufene Besitzrechte nie still übernommen. Umkehrbare Aufgaben erledigt er. Unumkehrbare Verben wie senden, veröffentlichen, löschen oder zahlen führt er nie selbst aus. Sie werden als Entscheidung festgehalten, ein Mensch gibt frei, ein späterer Lauf führt aus und schreibt den Namen dazu. Am Ende kompiliert ein Integrator die Übergabe aus allen Abschlüssen, mit Prüfsummen.',
      result:
        'Zwei Läufe und eine Sitzung gleichzeitig, mit und ohne Protokoll, aus den Dateien gezählt. Ohne Protokoll: 8 unumkehrbare Aktionen ohne Entscheidung, jede doppelt, die Änderung der Sitzung überschrieben, keine Übergabe. Mit Protokoll: 0 und 0, die Änderung erhalten, 8 Befunde in der Übergabe, 3 Entscheidungen nach Freigabe ausgeführt, 1 abgelehnt. 16 Tests.',
      notShown:
        'Keine echte Arbeit, eine Aufgabe erledigen heißt eine Zeile anhängen. Kein Netz, ein Rechner. Kein Zeitplaner, kein Sprachmodell. Das Schreibjournal steckt bewusst nicht noch einmal drin, das zeigt das Projekt zu den gleichzeitigen Schreibzugriffen. Zwei Entwurfsfehler, die der Vergleichslauf gefunden hat, stehen in der README.',
    },
    en: {
      title: 'Routine runs on a folder tree, with approval before anything irreversible',
      problem:
        'A small organisation keeps its work in folders. People work in sessions, routines run unattended on a schedule. Without a protocol two writers land in the same project, a routine sends or deletes because the task said so, and what a run finds out is never seen by the next person.',
      approach:
        'A run takes projects one at a time; leased ones are skipped, expired leases are never taken over silently. Reversible tasks it does. Irreversible verbs such as send, publish, delete or pay it never executes itself. They are recorded as decisions, a person approves, a later run executes and writes down who approved. At the end an integrator compiles the handover from every completion, with checksums.',
      result:
        'Two runs and one session at the same moment, with and without the protocol, counted from the files. Without: 8 irreversible actions with no decision, each done twice, the session edit overwritten, no handover. With: 0 and 0, the edit kept, 8 findings in the handover, 3 decisions executed after approval, 1 rejected. 16 tests.',
      notShown:
        'No real work, doing a task means appending a line. No network, one machine. No scheduler, no language model. The write journal is deliberately not repeated here; the concurrent-writes project shows it. Two design mistakes the comparison run found are in the README.',
    },
  },
  {
    repo: 'fabiosteyer.github.io',
    url: 'https://github.com/FabioSteyer/fabiosteyer.github.io',
    stackDe: 'Astro · GSAP · Playwright',
    stackEn: 'Astro · GSAP · Playwright',
    eyebrow: 'ASTRO · GSAP · NODE TEST',
    statValue: '0',
    statDe: 'Externe Anfragen beim Laden dieser Seite.',
    statEn: 'External requests when this page loads.',
    de: {
      title: 'Diese Seite',
      problem:
        'Eine Bewerbungsseite muss zwei Dinge zugleich, gefallen und nachprüfbar sein. Alles, was hier steht, soll sich auf ein Repository, einen Test oder eine Messung zurückführen lassen, und die Seite selbst soll denselben Maßstab aushalten.',
      approach:
        'Statisch gebaut mit Astro, ausgeliefert ohne Server, ohne Analytics, ohne Verbindung zu Schriftendiensten. Die Bewegung läuft über GSAP mit Bewegungsreduzierung als Grundzustand. Drei Gestaltungsvarianten liegen auf einer Codebasis und werden per Build-Schalter gewählt. Tests laufen gegen den Produktionsbuild und prüfen unter anderem, dass die Datenschutzerklärung beschreibt, was die Seite wirklich tut.',
      result:
        '12 Seiten in zwei Sprachen, 0 externe Anfragen, 10 Tests gegen den Build, Barrierefreiheit 100 im Lighthouse-Lauf gegen die Live-Adresse. Die Texte der Seite sind mit dem Linter aus dem dritten Projekt geprüft.',
      notShown:
        'Kein Backend, kein Formular, keine Nutzerdaten. Das Repository enthält Bewerbungstexte und ein Foto und steht deshalb ohne Lizenz. Die Suchmaschinen-Kennzahl ist absichtlich niedrig, denn die Seite trägt noindex und ist nur über den geteilten Link zu finden.',
    },
    en: {
      title: 'This site',
      problem:
        'An application site has to do two things at once, look right and be verifiable. Everything here should trace back to a repository, a test or a measurement, and the site itself should hold to the same standard.',
      approach:
        'Built statically with Astro, served without a server, without analytics, without a connection to any font service. Motion runs through GSAP with reduced motion as the resting state. Three design variants sit on one codebase and are chosen by a build switch. Tests run against the production build and check, among other things, that the privacy statement describes what the site actually does.',
      result:
        '12 pages in two languages, 0 external requests, 10 tests against the build, accessibility 100 in the Lighthouse run against the live address. The texts on this site went through the linter from the third project.',
      notShown:
        'No backend, no form, no user data. The repository contains application texts and a photo and therefore carries no licence. The search score is low on purpose, because the site is noindex and only reachable through the shared link.',
    },
  },
];
