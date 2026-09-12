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
  de: ProjectText;
  en: ProjectText;
}

export const projects: Project[] = [
  {
    repo: 'invoice-quote-reconciliation',
    url: 'https://github.com/FabioSteyer/invoice-quote-reconciliation',
    stackDe: 'Python · pdfplumber · reportlab',
    stackEn: 'Python · pdfplumber · reportlab',
    de: {
      title: 'Rechnungen gegen Angebote prüfen',
      problem:
        'Ein Lieferant schickt ein Angebot und rechnet später dagegen ab. Ob die Rechnung dem entspricht, was vereinbart war, prüft bei dreistelligen Positionszahlen niemand Zeile für Zeile.',
      approach:
        'Beide Dokumente werden aus PDF ausgelesen, die Positionen einander zugeordnet und jede Abweichung mit ihrer Auswirkung in Euro gemeldet. Ein Generator erzeugt die Testbelege selbst und protokolliert, welche Abweichungen er eingebaut hat — dadurch lässt sich die Erkennungsleistung messen statt behaupten.',
      result:
        '4 von 4 eingebauten Abweichungen erkannt, 0 Fehlalarme, 20 Tests. Drei der sieben Testfälle enthalten bewusst keine Abweichung: Ein Einheitenwechsel und eine Teillieferung über zwei Rechnungen sind keine Fehler. Ein Prüfer, der sie meldet, wird nach zwei Wochen nicht mehr gelesen.',
      notShown:
        'Keine echten Lieferantenbelege — die erzeugten PDFs sind aufgeräumter als die Wirklichkeit. Kein OCR für Scans, keine proprietären Händlerformate, keine ERP-Anbindung.',
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
        'No real supplier documents — the generated PDFs are tidier than reality. No OCR for scans, no proprietary wholesaler formats, no ERP integration.',
    },
  },
  {
    repo: 'concurrent-file-writes',
    url: 'https://github.com/FabioSteyer/concurrent-file-writes',
    stackDe: 'Python · nur Standardbibliothek',
    stackEn: 'Python · standard library only',
    de: {
      title: 'Gleichzeitige Schreibzugriffe ohne Server koordinieren',
      problem:
        'Mehrere Prozesse arbeiten am selben Dateibaum. Es gibt keinen Datenbankserver, der Sperren vergibt — nur Dateien. Ohne Absprache überschreibt der langsamere Prozess stillschweigend, was der schnellere gerade gespeichert hat.',
      approach:
        'Wer schreiben will, deklariert vorab die Dateien samt der Hashes, die er vorgefunden hat, und holt eine globale Freigabe. Nach dem Schreiben prüft der Koordinator, ob ausschließlich deklarierte Dateien verändert wurden, und schreibt Vorher- und Nachher-Hash in ein Journal. Eine Lücke in dieser Kette beweist, dass jemand außerhalb des Verfahrens geschrieben hat.',
      result:
        'Derselbe Arbeitsauftrag, vier Prozesse, zwanzig erwartete Schreibvorgänge: ohne Koordination 14 verloren und 18 Kettenlücken, mit Koordination 0 und 0. Kein Lauf meldet dabei einen Fehler — genau das macht diese Fehlerklasse teuer. 18 Tests.',
      notShown:
        'Kein verteiltes System — ein Rechner, ein Dateisystem. Kein Lock-Manager: Eine globale Freigabe serialisiert alles, was bei seltenen Schreibvorgängen richtig und bei vielen falsch ist. Die Prüfung auf undeklarierte Änderungen hasht den ganzen Baum und skaliert nicht auf Hunderttausende Dateien.',
    },
    en: {
      title: 'Coordinating concurrent writes without a server',
      problem:
        'Several processes work on the same file tree. There is no database server handing out locks — there are only files. Without an agreement, the slower process silently overwrites what the faster one just saved.',
      approach:
        'Before writing, a process declares the files it intends to change together with the hashes it saw, and acquires a global lease. After the write the coordinator verifies that only declared files changed and appends the before and after hash to a journal. A gap in that chain proves somebody wrote outside the protocol.',
      result:
        'Same work, four processes, twenty writes expected: without coordination 14 lost and 18 chain gaps, with coordination 0 and 0. Neither run reports an error — which is exactly what makes this class of bug expensive. 18 tests.',
      notShown:
        'Not a distributed system — one machine, one filesystem. Not a lock manager: a single global lease serialises everything, which is right when writes are rare and wrong when they are not. Detecting undeclared changes hashes the whole tree and does not scale to hundreds of thousands of files.',
    },
  },
];
