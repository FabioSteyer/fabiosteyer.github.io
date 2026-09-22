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
      title: 'Anschreiben automatisch auf Floskeln prüfen',
      problem:
        'Wer viele Bewerbungen liest, erkennt Schablonentext in Sekunden und liest dann nicht weiter. Die Muster, die diesen Eindruck erzeugen, sind wenige und lassen sich benennen. Die Gegenüberstellung „nicht X, sondern Y", der Gedankenstrich mitten im Satz, Floskeln, fünf gleich lange Sätze hintereinander.',
      approach:
        'Ein fester Satz aus 17 Regeln findet diese Muster zuverlässig und immer gleich. Für die Umschreibung holt das Werkzeug Vorschläge von zwei KI-Modellen verschiedener Hersteller ein, eines ohne jede Vorgeschichte des Textes, das zweite als Gegenprobe. Jeder Vorschlag wird einzeln eingesetzt und nur behalten, wenn die Regeln danach nicht mehr Befunde zählen als vorher. Die Modelle schlagen vor, die Regeln entscheiden.',
      result:
        'Geprüft an 50 erfundenen Testsätzen, darunter 18 unauffällige, bei denen kein Werkzeug anschlagen darf: 36 von 36 eingebauten Mustern gefunden, 0 Fehlalarme, 29 automatische Tests. Ein englischer Beispielbrief geht durch das Verfahren von 6 Befunden auf 0. Der deutsche behält eine Warnung, weil die Umschreibungen alle Sätze gleich lang gemacht haben, und das Werkzeug sagt das auch.',
      notShown:
        'Kein Detektor für KI-Texte, und durch Umkehrung wird auch keiner daraus. Die Regelliste beruht auf eigener Beobachtung, nicht auf Literatur. Die mitgelieferten Modellantworten sind gekennzeichnete Platzhalter; echte Läufe brauchen zwei API-Schlüssel.',
    },
    en: {
      title: 'Checking a cover letter for stock phrasing, automatically',
      problem:
        'Anyone who reads many applications spots template prose within seconds and stops reading. The patterns that create that impression are few and can be named. The contrast "not X, but Y", the dash in the middle of a sentence, stock phrases, five sentences of the same length in a row.',
      approach:
        'A fixed set of 17 rules finds those patterns reliably and always in the same way. For the rewrite, the tool collects suggestions from two AI models by different vendors, one with no history of the text, the second as a cross-check. Each suggestion is applied on its own and kept only if the rules afterwards count no more findings than before. The models propose, the rules decide.',
      result:
        'Checked against 50 invented test sentences, 18 of them clean ones no tool may flag: 36 of 36 planted patterns found, 0 false alarms, 29 automated tests. An English example letter goes through the procedure from 6 findings to 0. The German one keeps one warning because the rewrites made every sentence the same length, and the tool says so.',
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
    statValue: '8 → 0',
    statDe: 'Unumkehrbare Aktionen ohne Freigabe, erst ohne, dann mit Protokoll.',
    statEn: 'Irreversible actions without approval, first without, then with the protocol.',
    de: {
      title: 'Automatisierung, die vor unumkehrbaren Schritten nachfragt',
      problem:
        'Ein Skript arbeitet nachts eine Aufgabenliste ab, während tagsüber Menschen an denselben Dateien arbeiten. Drei Dinge gehen dabei leise schief. Zwei Bearbeiter landen im selben Projekt, und der langsamere überschreibt den schnelleren. Das Skript verschickt eine E-Mail oder löscht etwas, weil es in der Liste stand. Und was das Skript herausgefunden hat, sieht am nächsten Morgen niemand.',
      approach:
        'Jeder Lauf sperrt ein Projekt für sich, bevor er es anfasst; ein gesperrtes Projekt wird übersprungen, eine verwaiste Sperre nie stillschweigend übernommen. Umkehrbare Aufgaben erledigt der Lauf selbst. Unumkehrbare wie Senden, Veröffentlichen, Löschen oder Bezahlen legt er einem Menschen zur Entscheidung vor; erst ein späterer Lauf führt das Freigegebene aus und hält fest, wer freigegeben hat. Zum Schluss fasst ein Abschlussschritt zusammen, was alle Läufe getan und gefunden haben, als Übergabe für die nächste Person.',
      result:
        'Zwei Läufe und eine Person gleichzeitig auf demselben Beispiel, einmal ohne und einmal mit Protokoll, danach aus den Dateien gezählt. Ohne Protokoll: 8 unumkehrbare Aktionen ohne Freigabe, jede doppelt ausgeführt, die Änderung der Person überschrieben, keine Übergabe. Mit Protokoll: 0 unumkehrbare Aktionen ohne Freigabe, keine Aufgabe doppelt, die Änderung erhalten, 8 Befunde in der Übergabe. 16 automatische Tests.',
      notShown:
        'Die Aufgaben sind Attrappen; eine erledigen heißt eine Zeile anhängen. Ein Rechner, kein Netzwerk, kein Zeitplaner, kein Sprachmodell. Zwei Entwurfsfehler, die erst der Vergleichslauf sichtbar gemacht hat, stehen offen in der README.',
    },
    en: {
      title: 'Unattended automation that asks a person before anything irreversible',
      problem:
        'A script works through a task list at night while people work on the same files during the day. Three things go quietly wrong. Two editors land in the same project, and the slower one overwrites the faster. The script sends an email or deletes something because the list said so. And whatever the script found out, nobody sees the next morning.',
      approach:
        'Each run locks a project for itself before touching it; a locked project is skipped, and an abandoned lock is never taken over silently. Reversible tasks the run does itself. Irreversible ones such as sending, publishing, deleting or paying it puts to a person for a decision; only a later run carries out what was approved and records who approved it. At the end a closing step sums up what all runs did and found, as a handover for the next person.',
      result:
        'Two runs and one person at the same moment on the same example, once without and once with the protocol, then counted from the files. Without: 8 irreversible actions without approval, each carried out twice, the person\'s edit overwritten, no handover. With: 0 irreversible actions without approval, no task done twice, the edit kept, 8 findings in the handover. 16 automated tests.',
      notShown:
        'The tasks are dummies; doing one means appending a line. One machine, no network, no scheduler, no language model. Two design mistakes that only the comparison run made visible are stated openly in the README.',
    },
  },
  {
    repo: 'fabiosteyer.github.io',
    url: 'https://github.com/FabioSteyer/fabiosteyer.github.io',
    stackDe: 'Astro · GSAP · Playwright',
    stackEn: 'Astro · GSAP · Playwright',
    eyebrow: 'ASTRO · GSAP · NODE TEST',
    statValue: '0',
    statDe: 'Anfragen an Dritte beim Besuch dieser Seite.',
    statEn: 'Requests to third parties when you visit this page.',
    de: {
      title: 'Diese Website, nach demselben Maßstab gebaut',
      problem:
        'Eine Bewerbungsseite soll gefallen und zugleich standhalten, wenn jemand nachrechnet. Jede Zahl hier soll auf ein Repository, einen Test oder eine Messung zurückführbar sein, und das gilt auch für die Seite selbst.',
      approach:
        'Statisch gebaut, ohne Server, ohne Tracking, ohne Schriften von fremden Diensten; beim Besuch verlässt keine Anfrage diese Adresse. Die Bewegung ist ein Zusatz, der sich abschalten lässt und bei der Systemeinstellung „weniger Bewegung" von selbst aus bleibt. Automatische Tests laufen gegen die fertige Seite und prüfen unter anderem, dass die Datenschutzerklärung beschreibt, was die Seite wirklich tut.',
      result:
        '8 Seiten in zwei Sprachen, 0 Anfragen an Dritte, 10 Tests gegen den fertigen Build, Barrierefreiheit 100 im Lighthouse-Lauf gegen die Live-Adresse. Die Texte dieser Seite sind mit dem Werkzeug aus dem dritten Projekt geprüft.',
      notShown:
        'Kein Backend, kein Formular, keine Nutzerdaten. Das Repository enthält Bewerbungstexte und ein Foto und steht deshalb ohne freie Lizenz. In Suchmaschinen ist die Seite absichtlich nicht zu finden; sie ist nur über den geteilten Link erreichbar.',
    },
    en: {
      title: 'This website, built to the same standard',
      problem:
        'An application site should look right and still hold up when somebody checks the numbers. Every figure here should trace back to a repository, a test or a measurement, and that applies to the site itself.',
      approach:
        'Built statically, without a server, without tracking, without fonts from outside services; no request leaves this address when you visit. Motion is an extra that can be switched off and stays off by itself under the system setting "reduce motion". Automated tests run against the finished site and check, among other things, that the privacy statement describes what the site actually does.',
      result:
        '8 pages in two languages, 0 requests to third parties, 10 tests against the finished build, accessibility 100 in the Lighthouse run against the live address. The texts on this site went through the tool from the third project.',
      notShown:
        'No backend, no form, no user data. The repository contains application texts and a photo and therefore carries no open licence. The site is deliberately not findable through search engines; it is reachable only through the shared link.',
    },
  },
];
