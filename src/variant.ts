/**
 * Gestaltungsvariante der Startseite (Build-Schalter, 16.09.2026).
 *
 *   a  "Redaktion": natives Scrollen, Pruefungslauf ueber zwei Belegen, Masken,
 *                   zeitbasierte Linien, Ueberblendung beim Seitenwechsel.
 *   b  "Fliessend": ScrollSmoother (die ganze Seite gleitet, Ebenen mit eigener
 *                   Geschwindigkeit), Belegfeld als Hero-Grafik, Seitenwechsel
 *                   als Schub von unten.
 *   c  "Buehne":    natives Scrollen, Vorhang-Enthuellung je Abschnitt, Hintergrund
 *                   wechselt je Abschnitt die Tiefe, Paar-Abgleich als Hero-Grafik,
 *                   Seitenwechsel als Wischen.
 *
 * Bauen: PUBLIC_VARIANT=a npm run build (Standard seit 16.09.2026, Entscheid Fabio: b).
 */
export type Variant = 'a' | 'b' | 'c';
const raw = (import.meta.env.PUBLIC_VARIANT ?? 'b') as string;
export const variant: Variant = raw === 'a' || raw === 'c' ? raw : 'b';
