export type Lang = 'de' | 'en';

// Alle internen Pfade mit abschliessendem Schraegstrich. GitHub Pages liefert
// /projekte/index.html aus und antwortet auf /projekte mit einer 301-Umleitung;
// jeder Klick kostete sonst einen zusaetzlichen Rundlauf (Lighthouse: "redirects").

// Nur noch Start und Über mich: Projekte und Kontakt sind seit dem 16.09.2026
// Abschnitte der One-Pager-Startseite und keine eigenen Seiten mehr. Eine
// Navigation, die auf Weiterleitungen zeigt, schickt den Leser im Kreis.
export const nav: Record<Lang, { href: string; label: string }[]> = {
  de: [
    { href: '/', label: 'Start' },
    { href: '/ueber-mich/', label: 'Über mich' },
  ],
  en: [
    { href: '/en/', label: 'Home' },
    { href: '/en/about/', label: 'About' },
  ],
};

export const legalNav: Record<Lang, { href: string; label: string }[]> = {
  de: [
    { href: '/impressum/', label: 'Impressum' },
    { href: '/datenschutz/', label: 'Datenschutz' },
  ],
  en: [
    { href: '/en/legal-notice/', label: 'Legal notice' },
    { href: '/en/privacy/', label: 'Privacy' },
  ],
};

export const strings: Record<Lang, Record<string, string>> = {
  de: {
    skip: 'Zum Inhalt springen',
    switch: 'English',
    siteName: 'Fabio Steyer',
  },
  en: {
    skip: 'Skip to content',
    switch: 'Deutsch',
    siteName: 'Fabio Steyer',
  },
};
