export type Lang = 'de' | 'en';

// Alle internen Pfade mit abschliessendem Schraegstrich. GitHub Pages liefert
// /projekte/index.html aus und antwortet auf /projekte mit einer 301-Umleitung;
// jeder Klick kostete sonst einen zusaetzlichen Rundlauf (Lighthouse: "redirects").

export const nav: Record<Lang, { href: string; label: string }[]> = {
  de: [
    { href: '/', label: 'Start' },
    { href: '/projekte/', label: 'Projekte' },
    { href: '/ueber-mich/', label: 'Über mich' },
    { href: '/kontakt/', label: 'Kontakt' },
  ],
  en: [
    { href: '/en/', label: 'Home' },
    { href: '/en/projects/', label: 'Projects' },
    { href: '/en/about/', label: 'About' },
    { href: '/en/contact/', label: 'Contact' },
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
