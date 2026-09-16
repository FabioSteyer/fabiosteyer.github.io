import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin);

/**
 * Bewegungsschicht der Startseite (optional geladen, siehe portfolio.ts).
 *
 * Grundsaetze: normales Dokument-Scrolling, kein Festhalten der Seite, kein
 * Scroll-Hijacking. Scrollgebundene Bewegung ist ueberall "scrub", die
 * Einstiegssequenz laeuft einmal in eigener Zeit. Reduzierte Bewegung
 * (Systemeinstellung oder Seitenschalter) setzt alles auf den statischen
 * Endzustand zurueck: die Seite ist ohne dieses Modul vollstaendig lesbar.
 *
 * Alle GSAP-Plugins sind seit 3.13 frei (auch kommerziell) und liegen im
 * npm-Paket: hier SplitText (Wort-Maske im Einleitungsabsatz) und MorphSVG
 * (Trennlinie zwischen Arbeitsweise und Projekten).
 */
type WriteEvent = { process: string; action: string; stored: string[] };
type EnterHook = { element: Element; run: () => void };

export function createMotion(initiallyReduced: boolean) {
  let disabled = initiallyReduced;
  let context: gsap.Context | undefined;
  let invoiceTimeline: gsap.core.Timeline | undefined;
  let writeTimeline: gsap.core.Timeline | undefined;
  let finishWrites: (() => void) | undefined;
  let invoiceRoot: HTMLElement | undefined;
  let writeRoot: HTMLElement | undefined;
  let introSplit: SplitText | undefined;
  const enterHooks: EnterHook[] = [];
  // Startdeckkraft .85 statt .65: Elemente unterhalb des sichtbaren Bereichs warten in
  // diesem Zustand auf ihren Einblend-Trigger. Bei .65 fiel gedaempfter Text dort auf
  // 4,19:1 (Lighthouse color-contrast, 16.09.2026); ab .85 halten alle Texte 4,5:1.
  const reveal = { y: 25, opacity: .85, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity' } as const;
  // Erstes Sichtbarwerden eines Beispiels: genau ein Durchlauf, keine Schleife.
  const watchEnter = ({ element, run }: EnterHook) => ScrollTrigger.create({ trigger: element, start: 'top 78%', once: true, onEnter: run });

  const resetDemos = () => {
    invoiceTimeline?.kill();
    writeTimeline?.kill();
    if (invoiceRoot) gsap.set(invoiceRoot.querySelectorAll('.paper,.match-orbit,.demo-result'), { clearProps: 'transform,opacity' });
    if (writeRoot) gsap.set(writeRoot.querySelector('.write-packet'), { clearProps: 'transform,opacity' });
    finishWrites?.();
    finishWrites = undefined;
  };

  /** Kennzahlen zaehlen hoch; am Ende steht exakt der Text aus dem Markup.
   *  Faellt das Modul aus, bleibt der Text unveraendert (Lehre aus F1). */
  const countUp = (element: HTMLElement) => {
    const original = element.textContent ?? '';
    const match = original.match(/\d[\d.,]*/);
    if (!match) return;
    const target = Number(match[0].replace(/[.,]/g, ''));
    const locale = document.documentElement.lang === 'de' ? 'de-DE' : 'en-GB';
    const state = { value: 0 };
    // Breite einfrieren, sonst schiebt die wachsende Zahl das Label daneben (CLS).
    element.style.minWidth = element.offsetWidth + 'px';
    gsap.to(state, {
      value: target, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 92%', once: true },
      onUpdate: () => { element.textContent = original.replace(match[0], Math.round(state.value).toLocaleString(locale)); },
      onComplete: () => { element.textContent = original; element.style.minWidth = ''; },
    });
  };

  const setup = () => {
    context?.revert();
    context = undefined;
    introSplit?.revert();
    introSplit = undefined;
    if (disabled) return;
    context = gsap.context(() => {
      const mobile = window.innerWidth < 761;
      const fresh = !window.location.hash && window.scrollY < 50;

      // --- Lesefortschritt in der Kopfzeile -------------------------------------
      gsap.fromTo('.reading-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true } });

      // --- Einstieg: Pruefungslauf ueber den beiden Belegen ----------------------
      // Reihenfolge: Schlagzeile aus der Maske, Absatz wortweise, Belege liegen
      // ineinander und faechern auf, ein Pruefstrahl laeuft ueber Angebot und
      // Rechnung, die abweichende Zeile wird markiert, das Haekchen klappt ein.
      // Bei Ankersprung oder bereits gescrollter Seite bleibt alles statisch.
      const front = document.querySelector<HTMLElement>('.doc-front');
      const back = document.querySelector<HTMLElement>('.doc-back');
      if (fresh && front && back) {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.from('.hero-line', { yPercent: 110, duration: 1, stagger: .11, ease: 'power4.out', clearProps: 'transform' }, 0)
          .from('.hero-answer', { y: 14, opacity: 0, duration: .7, clearProps: 'transform,opacity' }, .45);
        introSplit = SplitText.create('.hero-intro', {
          // aria: 'none' - SplitText wuerde sonst ein aria-label auf das <p> setzen,
          // was ARIA dort verbietet (axe: aria-prohibited-attr). Die Woerter bleiben
          // gewoehnliche Inline-Spans und werden zusammenhaengend vorgelesen.
          type: 'words', mask: 'words', autoSplit: true, aria: 'none',
          onSplit: self => gsap.from(self.words, { yPercent: 100, opacity: 0, duration: .6, stagger: .012, ease: 'power3.out' }),
        });
        intro.from('.cta-row, .availability', { y: 12, opacity: 0, duration: .6, stagger: .1, clearProps: 'transform,opacity' }, .8);
        // Belege: gestapelt starten (Rechnung direkt hinter dem Angebot), dann auffaechern.
        intro.from(back, { x: () => front.offsetLeft - back.offsetLeft + 10, y: () => front.offsetTop - back.offsetTop + 10, rotation: -6, duration: 1.2, ease: 'power3.inOut' }, .3)
          .from(front, { rotation: 0, y: 30, duration: 1.2, ease: 'power3.inOut' }, .3);
        // Pruefstrahl: erst ueber das Angebot, dann ueber die Rechnung; Zeilen leuchten mit.
        const sweep = (doc: HTMLElement, at: number) => {
          const scan = doc.querySelector('.scan');
          const rows = doc.querySelectorAll('i, .doc-row');
          intro.fromTo(scan, { top: '-30px', opacity: 0 }, { top: '100%', opacity: 1, duration: .9, ease: 'power1.inOut' }, at)
            .to(scan, { opacity: 0, duration: .2 }, at + .8)
            .fromTo(rows, { color: '#efc79f' }, { color: '#efc79f', duration: .1, stagger: .12 }, at + .1)
            .to(rows, { clearProps: 'color', duration: .4, stagger: .12 }, at + .45)
            .fromTo(doc.querySelectorAll('i'), { backgroundColor: '#efc79fbb' }, { backgroundColor: '#a9b7ad35', duration: .6, stagger: .12, ease: 'power1.out' }, at + .15);
        };
        sweep(front, 1.5);
        sweep(back, 2.3);
        intro.to(back.querySelector('.doc-row'), { color: '#e4735a', duration: .3 }, 3.0)
          .to(back.querySelector('.doc-flag'), { opacity: 1, scale: 1, duration: .45, ease: 'back.out(2.5)' }, 3.1)
          .from('.art-check', { rotateY: -90, transformOrigin: '0% 50%', transformPerspective: 600, duration: .7, ease: 'power3.out', clearProps: 'transform' }, 3.35);
        // Danach ein langsames Schweben, kaum wahrnehmbar, aber die Szene wirkt nicht eingefroren.
        intro.to([front, back], { y: '+=6', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .6 }, 4.2);
      } else {
        gsap.set('.doc-back .doc-row', { color: '#e4735a' });
        gsap.set('.doc-back .doc-flag', { opacity: 1, scale: 1 });
      }

      // --- Hero verlaesst den Bildschirm: Belege schachteln sich ineinander ------
      if (front && back) {
        gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } })
          // rotateY positiv: die rechte Kante (mit dem Haekchen) dreht vom Betrachter weg.
          // Negativ kaeme sie naeher und wuerde perspektivisch ueber den rechten Rand
          // projiziert (gemessen: Dokumentbreite 1.641 px bei 1.440 px).
          .to('.hero-art', { y: mobile ? -40 : -90, rotateY: mobile ? 14 : 26, rotateX: mobile ? 6 : 12, transformPerspective: 1000, ease: 'none' }, 0)
          .to(back, { x: () => front.offsetLeft - back.offsetLeft + 14, y: () => front.offsetTop - back.offsetTop + 14, rotation: -4, ease: 'none' }, 0)
          .to(front, { rotation: -2, z: 40, transformPerspective: 900, ease: 'none' }, 0)
          .to('.art-check', { y: 40, opacity: 0, ease: 'none' }, 0)
          .to('.hero-copy', { y: -30, opacity: .55, ease: 'none' }, 0);
      }

      // --- Kennzahlen zaehlen hoch ------------------------------------------------
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach(countUp);

      // --- Abschnittstitel steigen aus der Maske ---------------------------------
      gsap.utils.toArray<HTMLElement>('.section h2').forEach(heading => {
        gsap.from(heading.querySelectorAll('.line'), { yPercent: 110, duration: .9, stagger: .12, ease: 'power4.out', clearProps: 'transform', scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
      });

      // --- Einblendungen: Gruppen gestaffelt, Einzelelemente wie bisher -------------
      const grouped = new Set<HTMLElement>();
      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach(group => {
        const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', group);
        items.forEach(item => grouped.add(item));
        gsap.from(items, { ...reveal, stagger: .1, scrollTrigger: { trigger: group, start: 'top 92%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal]').filter(element => !grouped.has(element)).forEach(element => {
        gsap.from(element, { ...reveal, scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
      });
      enterHooks.forEach(watchEnter);

      // --- Arbeitsweise: Linie laeuft ueber die vier Schritte, Marken leuchten auf --
      const track = document.querySelector<HTMLElement>('.approach-track');
      if (track) {
        const steps = gsap.utils.toArray<HTMLElement>('li', track);
        gsap.timeline({ scrollTrigger: { trigger: track, start: 'top 85%', end: 'top 35%', scrub: .5 } })
          .to('.approach-line i', { scaleX: 1, ease: 'none', duration: 1 }, 0)
          .to(steps, { className: 'is-lit', stagger: { each: 1 / steps.length, from: 'start' }, duration: .001 }, 0);
      }

      // --- Trennlinie: zeichnet sich und wechselt ihre Form (MorphSVG) ---------------
      document.querySelectorAll<SVGPathElement>('.flow-draw').forEach(path => {
        const length = path.getTotalLength();
        const target = path.dataset.morph;
        const tl = gsap.timeline({ scrollTrigger: { trigger: path.closest('div'), start: 'top 90%', end: 'bottom 10%', scrub: .7 } });
        tl.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, ease: 'none', duration: .6 }, 0);
        if (target) tl.to(path, { morphSVG: target, ease: 'none', duration: .6 }, .4);
      });

      // --- Abschnitte als Blaetter im Raum ------------------------------------------
      // Jeder Abschnitt liegt beim Hereinscrollen nach hinten und richtet sich auf;
      // beim Verlassen kippt er an der Unterkante nach hinten weg. Beide Winkel zeigen
      // vom Betrachter weg: nahe Kanten wuerden perspektivisch breiter projiziert und
      // die Seite seitlich ueberlaufen lassen (gemessen: 1.778 px bei 1.440 px Fenster
      // mit +16 Grad). Deckkraft nicht unter .92 (multipliziert sich mit .85 der Einblendung).
      gsap.utils.toArray<HTMLElement>('.metrics, main .section').forEach(sheet => {
        const vh = window.innerHeight;
        const total = sheet.offsetHeight + vh;
        const enter = Math.min(.45, (vh * .5) / total);
        const leave = Math.min(.35, (vh * .4) / total);
        gsap.timeline({ scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'bottom top', scrub: .6 } })
          .fromTo(sheet, { rotateX: mobile ? -8 : -16, y: mobile ? 32 : 72, opacity: .92, transformOrigin: '50% 0%', transformPerspective: 1100 }, { rotateX: 0, y: 0, opacity: 1, duration: enter, ease: 'power1.out', force3D: false }, 0)
          .to(sheet, { rotateX: mobile ? -5 : -9, y: mobile ? -16 : -32, opacity: .9, transformOrigin: '50% 100%', duration: leave, ease: 'power1.in', force3D: false }, 1 - leave);
      });

      // --- Beispielflaechen schwingen an einem Scharnier in die Leseebene -------------
      gsap.utils.toArray<HTMLElement>('.project .demo').forEach((demo, index) => {
        gsap.from(demo, { rotateY: 22, x: index ? -50 : 50, transformOrigin: index ? '100% 50%' : '0% 50%', transformPerspective: 1200, ease: 'none', scrollTrigger: { trigger: demo, start: 'top 95%', end: 'top 45%', scrub: .6 } });
        // Tiefe: die Szene im Inneren bewegt sich etwas langsamer als der Rahmen.
        gsap.fromTo(demo.querySelector('.document-flow, .write-scene'), { y: 14 }, { y: -14, ease: 'none', scrollTrigger: { trigger: demo, start: 'top bottom', end: 'bottom top', scrub: .8 } });
      });

      // --- Hintergrund: Stern dreht sich mit dem Scrollen, Glanz wandert ------------
      gsap.to('.note-symbol', { rotation: 180, ease: 'none', scrollTrigger: { trigger: '.ai-note', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.to('.ambient', { y: 320, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1 } });
    });
  };
  setup();

  return {
    refresh() { if (!disabled) ScrollTrigger.refresh(); },
    onEnter(element: Element, run: () => void) {
      const hook = { element, run };
      enterHooks.push(hook);
      if (!disabled) context?.add(() => watchEnter(hook));
    },
    setReduced(value: boolean) { if (disabled === value) return; disabled = value; resetDemos(); setup(); },
    invoice(root: HTMLElement) {
      invoiceTimeline?.kill();
      invoiceRoot = root;
      const targets = root.querySelectorAll('.paper,.match-orbit,.demo-result');
      gsap.set(targets, { clearProps: 'transform,opacity' });
      if (disabled) return;
      invoiceTimeline = gsap.timeline()
        .from(root.querySelector('[data-paper="quote"]'), { x: -10, rotation: -2, duration: .35, ease: 'power2.out' })
        .from(root.querySelector('[data-paper="invoice"]'), { x: 10, rotation: 2, duration: .35, ease: 'power2.out' }, 0)
        .to(root.querySelector('.match-orbit'), { rotation: 180, duration: .65, ease: 'power2.inOut' }, .08)
        .from(root.querySelector('.demo-result'), { y: 7, opacity: .45, duration: .3, clearProps: 'transform,opacity' }, .3);
    },
    writes(root: HTMLElement, trace: WriteEvent[], render: (event: WriteEvent) => void, finish: () => void) {
      writeTimeline?.kill();
      finishWrites?.();
      finishWrites = finish;
      writeRoot = root;
      const packet = root.querySelector('.write-packet');
      if (disabled) { finish(); return; }
      writeTimeline = gsap.timeline({ onComplete: () => { finish(); finishWrites = undefined; } });
      trace.forEach((event, index) => {
        const at = index * .32;
        writeTimeline!.call(() => render(event), [], at);
        if (event.action === 'write') writeTimeline!.fromTo(packet, { y: 0, opacity: 1 }, { y: 47, opacity: 0, duration: .29, ease: 'power1.in' }, at);
      });
      writeTimeline.to({}, { duration: .3 });
    }
  };
}
