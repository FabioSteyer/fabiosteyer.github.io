import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, MorphSVGPlugin, DrawSVGPlugin);

/**
 * Bewegungsschicht der Startseite (optional geladen, siehe portfolio.ts).
 *
 * Drei Varianten auf derselben Grundlage (html[data-variant], siehe src/variant.ts):
 *   a "Redaktion"  natives Scrollen; Pruefungslauf ueber zwei Belegen; Linien
 *                  laufen zeitbasiert beim ersten Sichtbarwerden (kein Ruckeln
 *                  am Mausrad); keine 3D-Kippbewegungen.
 *   b "Fliessend"  ScrollSmoother: die ganze Seite gleitet, Ebenen mit eigener
 *                  Geschwindigkeit; Belegfeld als Hero-Grafik; Abschnitte kommen
 *                  als Ganzes leicht vergroessert heran.
 *   c "Buehne"     natives Scrollen; jeder Abschnitt wird wie ein Vorhang
 *                  enthuellt, der Hintergrund wechselt je Abschnitt die Tiefe;
 *                  Paar-Abgleich als Hero-Grafik.
 *
 * Gemeinsam: Einstieg in eigener Zeit, Lesefortschritt, Kennzahlen zaehlen hoch
 * (Endtext exakt aus dem Markup), Titel steigen aus Zeilenmasken, Beispiele
 * laufen beim ersten Sichtbarwerden einmal von selbst. Reduzierte Bewegung setzt
 * alles auf den statischen Endzustand zurueck.
 *
 * Alle GSAP-Plugins sind seit 3.13 frei und liegen im npm-Paket.
 */
type WriteEvent = { process: string; action: string; stored: string[] };
type EnterHook = { element: Element; run: () => void };
type Variant = 'a' | 'b' | 'c';

export function createMotion(initiallyReduced: boolean) {
  let disabled = initiallyReduced;
  let context: gsap.Context | undefined;
  let smoother: ScrollSmoother | undefined;
  let invoiceTimeline: gsap.core.Timeline | undefined;
  let writeTimeline: gsap.core.Timeline | undefined;
  let finishWrites: (() => void) | undefined;
  let invoiceRoot: HTMLElement | undefined;
  let writeRoot: HTMLElement | undefined;
  let introSplit: SplitText | undefined;
  let layoutRef: (() => void) | undefined;
  const enterHooks: EnterHook[] = [];
  const variant = (document.documentElement.dataset.variant ?? 'a') as Variant;
  // Startdeckkraft .85: Elemente unterhalb des sichtbaren Bereichs warten in diesem
  // Zustand; darunter faellt gedaempfter Text unter 4,5:1 (Lighthouse, 16.09.2026).
  const reveal = { y: 25, opacity: .85, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity' } as const;
  const watchEnter = ({ element, run }: EnterHook) => ScrollTrigger.create({ trigger: element, start: 'top 78%', once: true, onEnter: run });

  const resetDemos = () => {
    invoiceTimeline?.kill();
    writeTimeline?.kill();
    if (invoiceRoot) gsap.set(invoiceRoot.querySelectorAll('.paper,.match-orbit,.demo-result'), { clearProps: 'transform,opacity' });
    if (writeRoot) gsap.set(writeRoot.querySelector('.write-packet'), { clearProps: 'transform,opacity' });
    finishWrites?.();
    finishWrites = undefined;
  };

  /** Kennzahlen zaehlen hoch; am Ende steht exakt der Text aus dem Markup. */
  const countUp = (element: HTMLElement) => {
    const original = element.textContent ?? '';
    const match = original.match(/\d[\d.,]*/);
    if (!match) return;
    const target = Number(match[0].replace(/[.,]/g, ''));
    const locale = document.documentElement.lang === 'de' ? 'de-DE' : 'en-GB';
    const state = { value: 0 };
    element.style.minWidth = element.offsetWidth + 'px';
    gsap.to(state, {
      value: target, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 92%', once: true },
      onUpdate: () => { element.textContent = original.replace(match[0], Math.round(state.value).toLocaleString(locale)); },
      onComplete: () => { element.textContent = original; element.style.minWidth = ''; },
    });
  };

  /** Schlagzeile, Antwort, Absatz, Buttons - in allen Varianten gleich. */
  const introCopy = (intro: gsap.core.Timeline) => {
    intro.from('.hero-line', { yPercent: 110, duration: 1, stagger: .11, ease: 'power4.out', clearProps: 'transform' }, 0)
      .from('.hero-answer', { y: 14, opacity: 0, duration: .7, clearProps: 'transform,opacity' }, .45)
      .from('.cta-row, .availability', { y: 12, opacity: 0, duration: .6, stagger: .1, clearProps: 'transform,opacity' }, .8);
    introSplit = SplitText.create('.hero-intro', {
      // aria: 'none' - ein aria-label auf <p> waere ungueltig (axe: aria-prohibited-attr).
      type: 'words', mask: 'words', autoSplit: true, aria: 'none',
      onSplit: self => gsap.from(self.words, { yPercent: 100, opacity: 0, duration: .6, stagger: .012, ease: 'power3.out' }),
    });
  };
  const checkIn = (intro: gsap.core.Timeline, at: number) =>
    intro.from('.art-check', { rotateY: -90, transformOrigin: '0% 50%', transformPerspective: 600, duration: .7, ease: 'power3.out', clearProps: 'transform' }, at);

  // --- Variante a: Pruefungslauf ueber zwei Belegen ----------------------------
  const heroDocuments = (fresh: boolean) => {
    const front = document.querySelector<HTMLElement>('.doc-front');
    const back = document.querySelector<HTMLElement>('.doc-back');
    if (!front || !back) return;
    if (fresh) {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      introCopy(intro);
      intro.from(back, { x: () => front.offsetLeft - back.offsetLeft + 10, y: () => front.offsetTop - back.offsetTop + 10, rotation: -6, duration: 1.2, ease: 'power3.inOut' }, .3)
        .from(front, { rotation: 0, y: 30, duration: 1.2, ease: 'power3.inOut' }, .3);
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
        .to(back.querySelector('.doc-flag'), { opacity: 1, scale: 1, duration: .45, ease: 'back.out(2.5)' }, 3.1);
      checkIn(intro, 3.35);
      intro.to([front, back], { y: '+=6', duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .6 }, 4.2);
    } else {
      gsap.set('.doc-back .doc-row', { color: '#e4735a' });
      gsap.set('.doc-back .doc-flag', { opacity: 1, scale: 1 });
    }
    // Beim Scrollen schachteln sich die Belege wieder ineinander, das Haekchen taucht ab.
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } })
      .to('.hero-art', { y: -60, ease: 'none' }, 0)
      .to(back, { x: () => front.offsetLeft - back.offsetLeft + 14, y: () => front.offsetTop - back.offsetTop + 14, rotation: -4, ease: 'none' }, 0)
      .to(front, { rotation: -2, ease: 'none' }, 0)
      .to('.art-check', { y: 40, opacity: 0, ease: 'none' }, 0)
      .to('.hero-copy', { y: -30, opacity: .55, ease: 'none' }, 0);
  };

  // --- Variante b: Belegfeld -------------------------------------------------------
  const heroField = (fresh: boolean) => {
    const tiles = gsap.utils.toArray<HTMLElement>('.art-b .tile');
    if (!tiles.length) return;
    if (fresh) {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      introCopy(intro);
      intro.fromTo(tiles, { opacity: 0, scale: .5 }, { opacity: 1, scale: 1, duration: .6, stagger: { each: .008, from: 'random' }, clearProps: 'transform,opacity' }, .2)
        .fromTo('.field-scan', { top: '12%', opacity: 0 }, { top: '78%', opacity: 1, duration: 1.6, ease: 'power1.inOut' }, 1.1)
        .to('.field-scan', { opacity: 0, duration: .3 }, 2.6);
      // Kacheln gelten als geprueft, sobald der Strahl ihre Zeile passiert hat: Klasse
      // je Zeile (CSS-Transition), nicht 120 Farbtweens - die kosteten auf dem Telefon
      // rund 500 ms Blockierzeit (Lighthouse, 16.09.2026).
      for (let row = 0; row < 10; row++) {
        intro.call(() => tiles.slice(row * 12, row * 12 + 12).forEach(tile => tile.classList.add('is-checked')), [], 1.2 + row * .15);
      }
      gsap.utils.toArray<HTMLElement>('.art-b .tile.flagged').forEach((tile, i) => {
        intro.call(() => tile.classList.add('is-flagged'), [], 2.1 + i * .18)
          .fromTo(tile, { scale: 1 }, { scale: 1.3, duration: .35, yoyo: true, repeat: 1, ease: 'power2.inOut', clearProps: 'transform' }, 2.1 + i * .18);
      });
      intro.from('.field-legend', { opacity: 0, y: 8, duration: .5, clearProps: 'transform,opacity' }, 2.7);
      checkIn(intro, 3.0);
    } else {
      tiles.forEach(tile => tile.classList.add('is-checked', ...(tile.classList.contains('flagged') ? ['is-flagged'] : [])));
    }
  };

  // --- Variante c: Paar-Abgleich ---------------------------------------------------
  const heroPairs = (fresh: boolean) => {
    const links = gsap.utils.toArray<SVGPathElement>('.art-c .link');
    if (!links.length) return;
    const cols = gsap.utils.toArray<HTMLElement>('.art-c .pair-col');
    const miss = document.querySelector('.art-c .pair-row.miss');
    // Verbinder exakt auf die Zeilenmitten legen (Pixelkoordinaten, bei Resize neu).
    const layoutLinks = () => {
      const box = document.querySelector<SVGSVGElement>('.art-c .pair-links');
      const pairs = box?.parentElement;
      if (!box || !pairs) return;
      const origin = pairs.getBoundingClientRect();
      box.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
      const left = cols[0].querySelectorAll('.pair-row');
      const right = cols[1].querySelectorAll('.pair-row');
      links.forEach((link, i) => {
        const a = left[i].getBoundingClientRect();
        const b = right[i].getBoundingClientRect();
        const y1 = a.top + a.height / 2 - origin.top, y2 = b.top + b.height / 2 - origin.top;
        const x1 = a.right - origin.left, x2 = b.left - origin.left, mid = (x1 + x2) / 2;
        link.setAttribute('d', `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`);
      });
    };
    layoutLinks();
    if (layoutRef) ScrollTrigger.removeEventListener('refreshInit', layoutRef);
    layoutRef = layoutLinks;
    ScrollTrigger.addEventListener('refreshInit', layoutLinks);
    if (fresh) {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      introCopy(intro);
      intro.from('.art-c .pair-col:first-child .pair-row', { x: -24, opacity: 0, duration: .6, stagger: .07, clearProps: 'transform,opacity' }, .3)
        .from('.art-c .pair-col:last-child .pair-row', { x: 24, opacity: 0, duration: .6, stagger: .07, clearProps: 'transform,opacity' }, .5)
        .from('.pair-head', { opacity: 0, duration: .4, clearProps: 'opacity' }, .4)
        .fromTo(links.filter(l => !l.classList.contains('link-miss')), { drawSVG: '0%' }, { drawSVG: '100%', duration: .55, stagger: .18, ease: 'power2.inOut' }, 1.2)
        .fromTo('.art-c .link-miss', { drawSVG: '0%' }, { drawSVG: '100%', duration: .7, ease: 'power2.inOut' }, 2.2);
      if (miss) intro.from(miss, { borderColor: '#a9b7ad33', backgroundColor: '#0f2a24', duration: .4 }, 2.7);
      intro.to('.pair-flag', { opacity: 1, scale: 1, duration: .45, ease: 'back.out(2.5)' }, 2.9);
      checkIn(intro, 3.2);
    } else {
      gsap.set('.pair-flag', { opacity: 1, scale: 1 });
    }
    // Beim Scrollen driften die Spalten auseinander, die Verbinder dehnen sich.
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } })
      .to('.hero-art', { y: -60, opacity: .35, ease: 'none' }, 0)
      .to('.art-check, .pair-flag', { opacity: 0, ease: 'none' }, 0)
      .to('.hero-copy', { y: -30, opacity: .55, ease: 'none' }, 0);
  };

  const setup = () => {
    context?.revert();
    context = undefined;
    introSplit?.revert();
    introSplit = undefined;
    smoother?.kill();
    smoother = undefined;
    if (disabled) return;
    context = gsap.context(() => {
      const fresh = !window.location.hash && window.scrollY < 50;
      const timeBased = variant === 'a';

      const mobile = window.innerWidth < 761;
      if (variant === 'b' && !mobile) {
        // Die ganze Seite gleitet; Ebenen mit eigener Geschwindigkeit (effects).
        // Nur am Desktop: auf dem Telefon kostete das Einrichten 580 ms Blockierzeit
        // (Lighthouse mobil, 16.09.2026), und Touch-Scrollen soll nativ bleiben.
        smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, effects: true, smoothTouch: false });
        smoother.effects('.hero-art', { speed: .88 });
        smoother.effects('.project .demo', { speed: 1.04 });
        smoother.effects('.ai-note', { speed: .93 });
        smoother.effects('.contact-links', { speed: 1.06 });
        smoother.effects('.section-heading', { lag: .08 });
        // Ankerlinks mit Abstand zur festen Kopfzeile.
        document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
          const target = link.hash && document.querySelector<HTMLElement>(link.hash);
          if (!target || !smoother) return;
          event.preventDefault();
          history.pushState(null, '', link.hash);
          smoother.scrollTo(target, true, 'top 100px');
        }));
        if (window.location.hash) {
          const target = document.querySelector<HTMLElement>(window.location.hash);
          if (target) smoother.scrollTo(target, false, 'top 100px');
        }
      }

      // Lesefortschritt (leicht geglaettet, damit das Mausrad nicht in Stufen springt).
      gsap.fromTo('.reading-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: .4 } });

      if (variant === 'a') heroDocuments(fresh);
      if (variant === 'b') heroField(fresh);
      if (variant === 'c') heroPairs(fresh);

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach(countUp);

      gsap.utils.toArray<HTMLElement>('.section h2').forEach(heading => {
        gsap.from(heading.querySelectorAll('.line'), { yPercent: 110, duration: .9, stagger: .12, ease: 'power4.out', clearProps: 'transform', scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
      });

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

      // Arbeitsweise: Laufline ueber die vier Schritte, Marken leuchten auf.
      // a: zeitbasiert beim ersten Sichtbarwerden; b/c: an den Scrollweg gebunden, geglaettet.
      const track = document.querySelector<HTMLElement>('.approach-track');
      if (track) {
        const steps = gsap.utils.toArray<HTMLElement>('li', track);
        const tl = gsap.timeline(timeBased
          ? { scrollTrigger: { trigger: track, start: 'top 80%', once: true } }
          : { scrollTrigger: { trigger: track, start: 'top 85%', end: 'top 30%', scrub: .9 } });
        const total = timeBased ? 1.4 : 1;
        tl.to('.approach-line i', { scaleX: 1, ease: timeBased ? 'power2.inOut' : 'none', duration: total }, 0);
        steps.forEach((step, index) => {
          const at = (index + .5) * total / steps.length;
          tl.to(step, { borderTopColor: '#d98a4f', duration: .25 }, at)
            .to(step.querySelector('.step-node'), { color: '#9fd3b8', duration: .25 }, at);
        });
      }

      // Trennlinie: zeichnet sich und wechselt ihre Form (MorphSVG).
      document.querySelectorAll<SVGPathElement>('.flow-draw').forEach(path => {
        const target = path.dataset.morph;
        const tl = gsap.timeline(timeBased
          ? { scrollTrigger: { trigger: path.closest('div'), start: 'top 85%', once: true } }
          : { scrollTrigger: { trigger: path.closest('div'), start: 'top 90%', end: 'bottom 10%', scrub: .9 } });
        tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', ease: timeBased ? 'power2.inOut' : 'none', duration: timeBased ? 1.3 : .6 }, 0);
        if (target) tl.to(path, { morphSVG: target, ease: timeBased ? 'power1.inOut' : 'none', duration: timeBased ? 1.2 : .6 }, timeBased ? .9 : .4);
      });

      if (variant === 'b') {
        // Abschnitte kommen als Ganzes leicht vergroessert heran - die Seite atmet,
        // keine Einzelgrafik kippt.
        gsap.utils.toArray<HTMLElement>('main .section').forEach(section => {
          // Deckkraft nicht unter .92 (multipliziert sich mit .85 der Einblendung; bei .8 fiel
          // gedaempfter Text auf 4,43:1).
          gsap.from(section, { scale: .965, opacity: .92, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: section, start: 'top 95%', end: 'top 40%', scrub: .8 } });
        });
      }

      if (variant === 'c') {
        // Vorhang: jeder Abschnitt wird von oben nach unten freigegeben; der
        // Hintergrund wechselt je Abschnitt die Tiefe.
        const stages: Record<string, string> = { start: '#0b211c', arbeitsweise: '#0d2721', projekte: '#10302a', hintergrund: '#123329', kontakt: '#0b211c' };
        gsap.utils.toArray<HTMLElement>('main .section').forEach(section => {
          gsap.fromTo(section, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none', scrollTrigger: { trigger: section, start: 'top 96%', end: 'top 42%', scrub: .7 } });
          gsap.from(section.children, { y: 48, ease: 'none', scrollTrigger: { trigger: section, start: 'top 96%', end: 'top 42%', scrub: .7 } });
        });
        gsap.utils.toArray<HTMLElement>('main section[id]').forEach(section => {
          const color = stages[section.id];
          if (!color) return;
          ScrollTrigger.create({ trigger: section, start: 'top 55%', end: 'bottom 55%',
            onEnter: () => gsap.to(document.body, { '--stage': color, duration: 1, ease: 'power1.inOut' }),
            onEnterBack: () => gsap.to(document.body, { '--stage': color, duration: 1, ease: 'power1.inOut' }) });
        });
      }

      gsap.to('.note-symbol', { rotation: 180, ease: 'none', scrollTrigger: { trigger: '.ai-note', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      if (variant !== 'b') gsap.to('.ambient', { y: 320, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1 } });
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
