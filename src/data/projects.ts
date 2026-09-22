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
];
