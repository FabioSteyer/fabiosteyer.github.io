// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://fabiosteyer.github.io',
  // User-Site: kein Unterpfad noetig.
  base: '/',
  trailingSlash: 'ignore',
  // Seit dem 16.09.2026 traegt die Startseite als One-Pager die Inhalte von
  // Projekte und Kontakt. Die alten Adressen bleiben erreichbar und zeigen auf
  // den passenden Abschnitt, damit bereits verschickte Links nicht ins Leere
  // laufen. Ueber mich bleibt eine eigene Seite: dort stehen die Belegtabelle
  // und das Foto, die der One-Pager nicht traegt.
  redirects: {
    '/projekte': '/#projekte',
    '/kontakt': '/#kontakt',
    '/en/projects': '/en/#projekte',
    '/en/contact': '/en/#kontakt',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
