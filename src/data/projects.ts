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
    statDe: 'Eingebaute Muster in Testsätzen erkannt. Keine Fehlalarme.',
    statEn: 'Planted patterns in test sentences caught. No false alarms.',
    de: {
      title: 'Texte automatisch auf Floskeln prüfen und umschreiben lassen',
      problem:
        'Ein Text, der nach Schablone klingt, wird überflogen, egal ob Anschreiben, Angebot, Bericht oder Produkttext. Die Muster, die diesen Eindruck erzeugen, sind wenige und lassen sich benennen. Die Gegenüberstellung „nicht X, sondern Y", der Gedankenstrich mitten im Satz, Floskeln, fünf gleich lange Sätze hintereinander.',
      approach:
        'Ein fester Satz aus 17 Regeln findet diese Muster zuverlässig und immer gleich. Für die Umschreibung holt das Werkzeug Vorschläge von zwei KI-Modellen verschiedener Hersteller ein, eines ohne jede Vorgeschichte des Textes, das zweite als Gegenprobe. Jeder Vorschlag wird einzeln eingesetzt und nur behalten, wenn die Regeln danach nicht mehr Befunde zählen als vorher. Die Modelle schlagen vor, die Regeln entscheiden.',
      result:
        'Geprüft an 50 erfundenen Testsätzen, darunter 18 unauffällige, bei denen kein Werkzeug anschlagen darf: 36 von 36 eingebauten Mustern gefunden, 0 Fehlalarme, 29 automatische Tests. Ein englischer Beispieltext geht durch das Verfahren von 6 Befunden auf 0. Der deutsche behält eine Warnung, weil die Umschreibungen alle Sätze gleich lang gemacht haben, und das Werkzeug sagt das auch.',
      notShown:
        'Kein Detektor für KI-Texte, und durch Umkehrung wird auch keiner daraus. Die Regelliste beruht auf eigener Beobachtung, nicht auf Literatur. Die mitgelieferten Modellantworten sind gekennzeichnete Platzhalter; echte Läufe brauchen zwei API-Schlüssel.',
    },
    en: {
      title: 'Checking any text for stock phrasing and having it rewritten',
      problem:
        'A text that reads like a template gets skimmed, whether it is a cover letter, a quote, a report or product copy. The patterns that create that impression are few and can be named. The contrast "not X, but Y", the dash in the middle of a sentence, stock phrases, five sentences of the same length in a row.',
      approach:
        'A fixed set of 17 rules finds those patterns reliably and always in the same way. For the rewrite, the tool collects suggestions from two AI models by different vendors, one with no history of the text, the second as a cross-check. Each suggestion is applied on its own and kept only if the rules afterwards count no more findings than before. The models propose, the rules decide.',
      result:
        'Checked against 50 invented test sentences, 18 of them clean ones no tool may flag: 36 of 36 planted patterns found, 0 false alarms, 29 automated tests. An English example text goes through the procedure from 6 findings to 0. The German one keeps one warning because the rewrites made every sentence the same length, and the tool says so.',
      notShown:
        'Not a detector for AI-written text, and inverting it does not make one. The rule list rests on my own observation rather than on literature. The shipped model answers are labelled placeholders; real runs need two API keys.',
    },
  },
  {
    repo: 'gated-routine-runner',
    url: 'https://github.com/FabioSteyer/gated-routine-runner',
    stackDe: 'Python · nur Standardbibliothek',
    stackEn: 'Python · standard library only',
    eyebrow: 'PYTHON · STANDARD LIBRARY · THREADS',
    statValue: '12 / 12',
    statDe: 'Aufgaben abgearbeitet oder vorgelegt, ohne dass jemand einen Lauf begleitet.',
    statEn: 'Tasks worked through or put forward, with nobody attending a run.',
    de: {
      title: 'Arbeit, die von selbst weiterläuft, ohne dass jemand sie anstößt',
      problem:
        'In einer kleinen Organisation bleibt vieles liegen, weil jemand es anstoßen müsste: Listen abarbeiten, Zahlen zusammentragen, Ergebnisse festhalten. Sollen geplante Läufe das nachts von selbst erledigen, während tagsüber Menschen an denselben Dateien arbeiten, braucht es drei Dinge. Eine Regel, wer gerade woran darf. Eine Übergabe, damit am nächsten Morgen sichtbar ist, was passiert ist. Und eine Grenze für das, was ein Lauf nie ohne Menschen tun darf.',
      approach:
        'Jeder Lauf nimmt sich ein Projekt nach dem anderen vor, sperrt es kurz für sich und arbeitet die offenen Aufgaben ab; ein Projekt, an dem gerade jemand sitzt, wird übersprungen und beim nächsten Lauf erledigt. Zum Schluss fasst ein Abschlussschritt zusammen, was alle Läufe getan und gefunden haben, als Übergabe für die nächste Person. Was unumkehrbar ist, etwa Senden, Veröffentlichen, Löschen oder Bezahlen, legt ein Lauf nur vor; ein Mensch entscheidet, ein späterer Lauf führt aus und hält fest, wer freigegeben hat.',
      result:
        'Zwei geplante Läufe und eine Person gleichzeitig auf demselben Beispiel mit 12 Aufgaben in drei Projekten, einmal ohne und einmal mit Protokoll, danach aus den Dateien gezählt. Mit Protokoll: alle 12 Aufgaben abgearbeitet oder zur Entscheidung vorgelegt, keine doppelt, 8 Befunde in der Übergabe, die Änderung der Person erhalten, 0 unumkehrbare Aktionen ohne Freigabe. Ohne Protokoll: Aufgaben doppelt erledigt, die Änderung der Person überschrieben, keine Übergabe, 8 unumkehrbare Aktionen ohne Freigabe. 16 automatische Tests.',
      notShown:
        'Die Aufgaben sind Attrappen; eine erledigen heißt eine Zeile anhängen. Wann ein Lauf startet, bestimmt ein Zeitplaner außerhalb, der nicht mitgeliefert ist. Ein Rechner, kein Netzwerk, kein Sprachmodell. Zwei Entwurfsfehler, die erst der Vergleichslauf sichtbar gemacht hat, stehen offen in der README.',
    },
    en: {
      title: 'Work that keeps going by itself, with nobody having to start it',
      problem:
        'In a small organisation a lot stays undone because somebody would have to start it: working through lists, gathering figures, writing down results. If scheduled runs are to do that at night by themselves while people work on the same files during the day, three things are needed. A rule for who may work on what right now. A handover, so that the next morning it is visible what happened. And a line for what a run must never do without a person.',
      approach:
        'Each run takes one project at a time, locks it briefly for itself and works through the open tasks; a project somebody is sitting at is skipped and done on the next run. At the end a closing step sums up what all runs did and found, as a handover for the next person. Anything irreversible, such as sending, publishing, deleting or paying, a run only puts forward; a person decides, a later run carries it out and records who approved.',
      result:
        'Two scheduled runs and one person at the same moment on the same example with 12 tasks in three projects, once without and once with the protocol, then counted from the files. With the protocol: all 12 tasks worked through or put forward for a decision, none twice, 8 findings in the handover, the person\'s edit kept, 0 irreversible actions without approval. Without: tasks done twice, the person\'s edit overwritten, no handover, 8 irreversible actions without approval. 16 automated tests.',
      notShown:
        'The tasks are dummies; doing one means appending a line. When a run starts is up to a scheduler outside, which is not included. One machine, no network, no language model. Two design mistakes that only the comparison run made visible are stated openly in the README.',
    },
  },
  {
    repo: 'fabiosteyer.github.io',
    url: 'https://github.com/FabioSteyer/fabiosteyer.github.io',
    stackDe: 'Astro · GSAP · Playwright',
    stackEn: 'Astro · GSAP · Playwright',
    eyebrow: 'ASTRO · GSAP · NODE TEST',
    statValue: '6',
    statDe: 'Arbeitstage vom leeren Repository bis zu dieser Seite mit fünf Projekten.',
    statEn: 'Working days from an empty repository to this page with five projects.',
    de: {
      title: 'Diese Website, mit KI-Werkzeugen in sechs Arbeitstagen gebaut',
      problem:
        'Eine Seite wie diese hätte vor wenigen Jahren Wochen gekostet: Gestaltung, zwei Sprachen, Bewegung, Rechtstexte, Tests. Mit KI-Werkzeugen als Mitarbeiter geht das in Tagen, wenn man weiß, was man will, die Entscheidungen selbst trifft und jedes Ergebnis nachprüft. Diese Seite ist der Beleg dafür, samt Commit-Verlauf.',
      approach:
        'Erst ein schriftlicher Entwurf, dann der Code, von KI-Werkzeugen geschrieben und von mir abgenommen. Drei Gestaltungsvarianten an einem Tag auf einer Codebasis gebaut, im Browser verglichen, eine gewählt. Automatische Tests laufen gegen die fertige Seite und prüfen unter anderem, dass die Datenschutzerklärung beschreibt, was die Seite wirklich tut. Statisch ausgeliefert, ohne Tracking und ohne fremde Dienste; beim Besuch verlässt keine Anfrage diese Adresse.',
      result:
        'Über 30 Commits an 6 Arbeitstagen, live seit dem zweiten Tag. 8 Seiten in zwei Sprachen, 0 Anfragen an Dritte, 10 Tests gegen den fertigen Build, Barrierefreiheit 100 im Lighthouse-Lauf gegen die Live-Adresse. Die Texte dieser Seite sind mit dem Werkzeug aus dem dritten Projekt geprüft.',
      notShown:
        'Sechs Arbeitstage heißt nicht sechs volle Tage am Stück; sie liegen über zwei Wochen verteilt. Kein Backend, kein Formular, keine Nutzerdaten. Das Repository enthält Bewerbungstexte und ein Foto und steht deshalb ohne freie Lizenz. In Suchmaschinen ist die Seite absichtlich nicht zu finden; sie ist nur über den geteilten Link erreichbar.',
    },
    en: {
      title: 'This website, built with AI tools in six working days',
      problem:
        'A site like this would have taken weeks a few years ago: design, two languages, motion, legal pages, tests. With AI tools as collaborators it takes days, provided you know what you want, make the decisions yourself and check every result. This site is the evidence, commit history included.',
      approach:
        'A written design first, then the code, written by AI tools and reviewed by me. Three design variants built in one day on one codebase, compared in the browser, one chosen. Automated tests run against the finished site and check, among other things, that the privacy statement describes what the site actually does. Served statically, without tracking and without outside services; no request leaves this address when you visit.',
      result:
        'Over 30 commits across 6 working days, live since day two. 8 pages in two languages, 0 requests to third parties, 10 tests against the finished build, accessibility 100 in the Lighthouse run against the live address. The texts on this site went through the tool from the third project.',
      notShown:
        'Six working days does not mean six full days in a row; they are spread over two weeks. No backend, no form, no user data. The repository contains application texts and a photo and therefore carries no open licence. The site is deliberately not findable through search engines; it is reachable only through the shared link.',
    },
  },
];
