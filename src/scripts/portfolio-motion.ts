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
  const panelTimelines = new Map<HTMLElement, gsap.core.Timeline>();
  const panelSplits = new Map<HTMLElement, SplitText>();
  const panelSelector = '.chain-steps li,.chain-node,.chain-packet,.scan-bar,.prose-before mark,.prose-after,.prose-rule,.compare-table tbody tr,.cmp-bad,.cmp-good,.check-list li,.tick,.run-actors,.run-actor,.run-project,.run-project li,.run-handover,.run-hlines li,.build-strip li,.build-strip b,.build-strip span,.build-marker,.build-track,.fact-grid dt';
  let introSplit: SplitText | undefined;
  let layoutRef: (() => void) | undefined;
  const enterHooks: EnterHook[] = [];
  const returnHooks: EnterHook[] = [];
  const variant = (document.documentElement.dataset.variant ?? 'a') as Variant;
  // Startdeckkraft .85: Elemente unterhalb des sichtbaren Bereichs warten in diesem
  // Zustand; darunter faellt gedaempfter Text unter 4,5:1 (Lighthouse, 16.09.2026).
  const reveal = { y: 25, opacity: .85, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity' } as const;
  const watchEnter = ({ element, run }: EnterHook) => ScrollTrigger.create({ trigger: element, start: 'top 78%', once: true, onEnter: run });
  // Erneuter Eintritt: der erste onEnter gehoert dem vollen Aufbau (watchEnter), danach
  // zaehlt jedes Zurueck- (onEnterBack) oder Wiederkommen (onEnter) als Rueckkehr.
  const watchReturn = ({ element, run }: EnterHook) => {
    let seen = false;
    ScrollTrigger.create({ trigger: element, start: 'top 78%', end: 'bottom 22%',
      onEnter: () => { if (seen) run(); seen = true; }, onEnterBack: run });
  };

  const resetDemos = () => {
    invoiceTimeline?.kill();
    writeTimeline?.kill();
    if (invoiceRoot) gsap.set(invoiceRoot.querySelectorAll('.paper,.match-orbit,.demo-result'), { clearProps: 'transform,opacity' });
    if (writeRoot) gsap.set(writeRoot.querySelector('.write-packet'), { clearProps: 'transform,opacity' });
    finishWrites?.();
    finishWrites = undefined;
    panelTimelines.forEach((tl, root) => {
      tl.kill();
      panelSplits.get(root)?.revert();
      gsap.set(root.querySelectorAll(panelSelector), { clearProps: 'all' });
      root.querySelectorAll('.locked,.held,.done,.wait,.lit').forEach(el => el.classList.remove('locked', 'held', 'done', 'wait', 'lit'));
      root.querySelectorAll<HTMLElement>('.run-state').forEach(el => { el.textContent = ''; });
      root.querySelectorAll<HTMLElement>('[data-countdown]').forEach(el => { if (el.dataset.final) el.textContent = el.dataset.final; });
      root.querySelectorAll<HTMLElement>('.run-hcount').forEach(el => { el.textContent = '8 / 8'; });
    });
    panelTimelines.clear();
    panelSplits.clear();
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
      returnHooks.forEach(watchReturn);

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

      // KI-Notiz: der Kupferrand zieht sich von oben auf, Titel und Zeilen folgen ihm.
      // Zeitbasiert (einmalig), damit nichts am Mausrad haengt.
      document.querySelectorAll<HTMLElement>('.ai-note').forEach(note => {
        const rule = note.querySelector<HTMLElement>('.note-rule');
        if (!rule) return;
        gsap.timeline({ scrollTrigger: { trigger: note, start: 'top 86%', once: true } })
          .from(rule, { scaleY: 0, transformOrigin: 'top', duration: .9, ease: 'power3.inOut' }, 0)
          .from(note.querySelectorAll('h3,p,.micro'), { y: 18, opacity: .85, duration: .7, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity' }, .25);
      });
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
    onReturn(element: Element, run: () => void) {
      const hook = { element, run };
      returnHooks.push(hook);
      if (!disabled) context?.add(() => watchReturn(hook));
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
    /** Panels der Karten 3 bis 5. 'full' baut den Inhalt auf (erster Anblick, Wiederholen-
     *  Knopf); 'light' spielt nur die Bewegungsakzente, ohne Text oder Zahlen zu verstecken
     *  (erneuter Eintritt beim Zurueck- oder Weiterscrollen). Endzustand = Markup. */
    panel(root: HTMLElement, mode: 'full' | 'light' = 'full') {
      if (mode === 'light' && panelTimelines.get(root)?.isActive()) return;
      panelTimelines.get(root)?.kill();
      panelSplits.get(root)?.revert();
      panelSplits.delete(root);
      gsap.set(root.querySelectorAll(panelSelector), { clearProps: 'all' });
      const full = mode === 'full';
      root.querySelectorAll('.locked,.held').forEach(el => el.classList.remove('locked', 'held'));
      if (full) {
        // Nur der volle Aufbau nimmt Haken, Marken und Zaehler zurueck; die leichte
        // Wiederholung laesst den gelesenen Inhalt stehen.
        root.querySelectorAll('.done,.wait,.lit').forEach(el => el.classList.remove('done', 'wait', 'lit'));
        root.querySelectorAll<HTMLElement>('.run-state').forEach(el => { el.textContent = ''; });
        root.querySelectorAll<HTMLElement>('[data-countdown]').forEach(el => { if (el.dataset.final) el.textContent = el.dataset.final; });
      }
      if (disabled) return;
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: () => { panelSplits.get(root)?.revert(); panelSplits.delete(root); } });
      panelTimelines.set(root, tl);
      const q = (sel: string) => root.querySelectorAll<HTMLElement>(sel);
      const one = (sel: string) => root.querySelector<HTMLElement>(sel);

      // Paket laeuft ueber die Kettenknoten; Knoten leuchten, wenn es ankommt.
      const packet = one('.chain-packet');
      const steps = Array.from(q('.chain-steps li'));
      const runPacket = (at: number, hop: number) => {
        if (!packet || !steps.length) return at;
        const ol = packet.parentElement!;
        const xAt = (li: HTMLElement) => li.offsetLeft + 14 - packet.offsetLeft;
        tl.set(packet, { x: xAt(steps[0]), opacity: 1 }, at);
        steps.forEach((li, i) => {
          const t0 = at + i * hop;
          if (i) tl.to(packet, { x: xAt(li), duration: hop * .7, ease: 'power1.inOut' }, t0 - hop * .7);
          tl.fromTo(li.querySelector('.chain-node'), { color: '#658573' }, { color: '#d98a4f', duration: .25, clearProps: 'color' }, t0)
            .fromTo(li, { borderColor: '#65857345' }, { borderColor: '#d98a4f99', duration: .25, yoyo: true, repeat: 1, clearProps: 'borderColor' }, t0);
        });
        tl.to(packet, { opacity: 0, duration: .3 }, at + (steps.length - 1) * hop + .3);
        void ol;
        return at + (steps.length - 1) * hop + .6;
      };

      if (root.dataset.panel === 'prose') {
        const mark = one('.prose-before mark');
        const scan = one('.scan-bar');
        const counter = one('[data-countdown]');
        const afterP = one('[data-words]');
        let at = 0;
        if (full) tl.from(steps, { opacity: .3, y: 8, duration: .4, stagger: .1, clearProps: 'transform,opacity' }, 0);
        // Scanbalken ueber den Vorher-Satz, die Fundstelle leuchtet auf.
        if (scan) {
          const h = scan.parentElement!.offsetHeight;
          tl.fromTo(scan, { y: 0, opacity: 0 }, { opacity: 1, duration: .15 }, .3)
            .to(scan, { y: h, duration: .9, ease: 'power1.inOut' }, .3)
            .to(scan, { opacity: 0, duration: .2 }, 1.1);
        }
        tl.fromTo(mark, { backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: '#e4735a55', duration: .3 }, .75)
          .to(mark, { backgroundColor: '#e4735a22', duration: .5, clearProps: 'backgroundColor' }, 1.15);
        if (full) tl.from(one('.prose-before .prose-rule'), { y: 6, opacity: 0, duration: .4, clearProps: 'transform,opacity' }, .9);
        at = runPacket(1.3, .55);
        if (full) {
          tl.from(one('.prose-after'), { y: 14, opacity: 0, duration: .5, clearProps: 'transform,opacity' }, at - .3);
          if (afterP) {
            const split = SplitText.create(afterP, { type: 'words', wordsClass: 'word', aria: 'none' });
            panelSplits.set(root, split);
            tl.from(split.words, { yPercent: 60, opacity: 0, duration: .45, stagger: .05, ease: 'power3.out' }, at - .1);
          }
          if (counter) {
            const [fail, warn] = (counter.dataset.countdown ?? '').split(',').map(Number);
            counter.dataset.final = counter.textContent ?? '';
            const state = { f: fail, w: warn };
            tl.call(() => { counter.textContent = `FAIL ${fail} · WARN ${warn}`; }, [], 0);
            tl.to(state, { f: 0, w: 0, duration: .9, ease: 'power1.inOut',
              onUpdate: () => { counter.textContent = `FAIL ${Math.round(state.f)} · WARN ${Math.round(state.w)}`; },
              onComplete: () => { counter.textContent = counter.dataset.final!; } }, at);
          }
          tl.from(one('.prose-after .prose-rule'), { opacity: 0, duration: .4, clearProps: 'opacity' }, at + .8);
        } else {
          tl.fromTo(one('.prose-after'), { boxShadow: '0 0 0 0 #9fd3b800' }, { boxShadow: '0 0 0 3px #9fd3b833', duration: .3, yoyo: true, repeat: 1, clearProps: 'boxShadow' }, at - .2);
        }
      }

      if (root.dataset.panel === 'runner') {
        // Nachgestellt aus dem Vergleichslauf: Person haelt atlas, Lauf A nimmt birch,
        // Lauf B nimmt cedar, beide ueberspringen atlas; Unumkehrbares wird vorgelegt;
        // nach dem Ende der Sitzung erledigt Lauf A atlas; die Uebergabe fuellt sich.
        const actors = { a: one('[data-actor=a]'), b: one('[data-actor=b]'), m: one('[data-actor=m]') };
        const proj = (id: string) => one(`[data-project=${id}]`)!;
        const lane = one('.run-actors')!;
        const moveTo = (actor: HTMLElement | null, id: string, at: number) => {
          if (!actor) return;
          tl.to(actor, { x: () => proj(id).offsetLeft + proj(id).offsetWidth / 2 - (actor.offsetLeft + actor.offsetWidth / 2), duration: .45, ease: 'power2.inOut' }, at);
        };
        const setState = (id: string, text: string, cls: '' | 'locked' | 'held', at: number) => {
          tl.call(() => { const p = proj(id); p.classList.remove('locked', 'held'); if (cls) p.classList.add(cls); p.querySelector('.run-state')!.textContent = text; }, [], at);
        };
        const de = document.documentElement.lang === 'de';
        const tx = (d: string, e: string) => de ? d : e;
        const hlines = Array.from(q('.run-hlines li'));
        const hcount = one('.run-hcount');
        let done = 0;
        const tick = (id: string, index: number, at: number) => {
          const li = proj(id).querySelectorAll('li')[index] as HTMLElement;
          const irr = li.classList.contains('irr');
          tl.call(() => {
            li.classList.add(irr ? 'wait' : 'done');
            if (!irr && full) { done += 1; if (hcount) hcount.textContent = `${done} / 8`; }
          }, [], at);
          if (!irr && full) tl.fromTo(hlines[Math.min(done, 7)] ?? hlines[7], { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: .3, clearProps: 'transform' }, at + .05);
          if (irr) tl.fromTo(li, { x: 0 }, { x: 3, duration: .12, yoyo: true, repeat: 1, clearProps: 'transform' }, at);
        };
        if (full) {
          tl.set(hlines, { scaleX: 0, transformOrigin: 'left' }, 0);
          tl.call(() => { if (hcount) hcount.textContent = '0 / 8'; }, [], 0);
          tl.from([lane, ...Array.from(q('.run-project')), one('.run-handover')], { opacity: 0, y: 8, duration: .4, stagger: .08, clearProps: 'transform,opacity' }, 0);
        }
        // t = .5: Person haelt atlas; Laeufe versuchen atlas, springen weiter.
        moveTo(actors.m, 'atlas', .5); setState('atlas', tx('Sitzung offen', 'session open'), 'held', .9);
        // Die Laeufe pruefen atlas (kurzes Aufleuchten), finden es belegt und gehen weiter.
        tl.fromTo(proj('atlas'), { boxShadow: 'inset 0 0 0 1px #9fd3b833' }, { boxShadow: 'inset 0 0 0 3px #d98a4f66', duration: .2, yoyo: true, repeat: 3, clearProps: 'boxShadow' }, 1.1);
        tl.call(() => { proj('atlas').querySelector('.run-state')!.textContent = tx('belegt, übersprungen', 'in use, skipped'); }, [], 1.3);
        moveTo(actors.a, 'birch', 1.5); setState('birch', tx('Lauf A', 'run A'), 'locked', 1.9);
        moveTo(actors.b, 'cedar', 1.6); setState('cedar', tx('Lauf B', 'run B'), 'locked', 2.0);
        // Arbeit in birch und cedar, versetzt.
        const birchAt = [2.1, 2.5, 2.9], cedarAt = [2.2, 2.6, 3.0, 3.4, 3.8];
        birchAt.forEach((t0, i) => tick('birch', i, t0));
        cedarAt.forEach((t0, i) => tick('cedar', i, t0));
        setState('birch', tx('abgeschlossen', 'complete'), '', 3.3);
        setState('cedar', tx('abgeschlossen', 'complete'), '', 4.2);
        // Sitzung endet, Lauf A holt atlas nach.
        tl.call(() => { proj('atlas').querySelector('.run-state')!.textContent = tx('Sitzung geschlossen', 'session closed'); proj('atlas').classList.remove('held'); }, [], 3.6);
        moveTo(actors.m, 'atlas', 3.6);
        tl.to(actors.m, { x: 0, duration: .45, ease: 'power2.inOut', clearProps: 'transform' }, 3.7);
        moveTo(actors.a, 'atlas', 3.9); setState('atlas', tx('Lauf A', 'run A'), 'locked', 4.3);
        [4.5, 4.9, 5.3, 5.7].forEach((t0, i) => tick('atlas', i, t0));
        setState('atlas', tx('abgeschlossen', 'complete'), '', 6.1);
        tl.to([actors.a, actors.b], { x: 0, duration: .5, ease: 'power2.inOut', clearProps: 'transform', stagger: .1 }, 6.2);
        tl.call(() => { proj('atlas').querySelector('.run-state')!.textContent = tx('Übergabe geschrieben', 'handover written'); }, [], 6.4);
        tl.fromTo(one('.run-handover'), { boxShadow: '0 0 0 0 #9fd3b800' }, { boxShadow: '0 0 0 3px #9fd3b833', duration: .35, yoyo: true, repeat: 1, clearProps: 'boxShadow' }, 6.4);
        if (full) {
          tl.from(q('.compare-table tbody tr'), { opacity: .25, x: -8, duration: .4, stagger: .1, clearProps: 'transform,opacity' }, 6.6)
            .from(q('.cmp-bad'), { opacity: 0, y: -6, duration: .35, stagger: .1, clearProps: 'transform,opacity' }, 6.7)
            .from(q('.cmp-good'), { opacity: 0, scale: .5, transformOrigin: '0 50%', duration: .4, stagger: .1, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 7.2);
        }
      }

      if (root.dataset.panel === 'site') {
        // Zeitmarke laeuft die sechs Arbeitstage ab, dann zaehlen die Fakten hoch.
        const days = Array.from(q('.build-strip li'));
        const marker = one('.build-marker');
        const track = one('.build-track');
        const hop = .42;
        if (marker && track && days.length && getComputedStyle(marker).display !== 'none') {
          const xAt = (li: HTMLElement) => li.offsetLeft + 6 - marker.offsetLeft;
          tl.set(track, { '--progress': 0 }, 0).set(marker, { x: xAt(days[0]), opacity: 1 }, 0);
          days.forEach((li, i) => {
            const t0 = .2 + i * hop;
            if (i) tl.to(marker, { x: xAt(li), duration: hop * .8, ease: 'power1.inOut' }, t0 - hop * .8)
              .to(track, { '--progress': i / (days.length - 1), duration: hop * .8, ease: 'power1.inOut' }, t0 - hop * .8);
            tl.call(() => li.classList.add('lit'), [], t0);
            if (full) tl.from(li.querySelectorAll('b,span'), { opacity: 0, y: 5, duration: .35, stagger: .05, clearProps: 'transform,opacity' }, t0);
          });
          tl.to(marker, { opacity: 0, duration: .3 }, .2 + days.length * hop);
          tl.set(track, { clearProps: '--progress' }, .2 + days.length * hop + .3);
        } else if (full) {
          tl.from(days, { opacity: 0, y: 5, duration: .35, stagger: .08, clearProps: 'transform,opacity' }, .1);
          days.forEach((li, i) => tl.call(() => li.classList.add('lit'), [], .2 + i * .1));
        }
        const factsAt = full ? .2 + days.length * hop : .2;
        if (full) {
          q('[data-fact]').forEach((dt, i) => {
            const original = dt.textContent ?? '';
            const match = original.match(/\d+/);
            if (!match) return;
            const target = Number(match[0]);
            const state = { v: 0 };
            dt.style.minWidth = dt.offsetWidth + 'px';
            tl.call(() => { dt.textContent = original.replace(match[0], '0'); }, [], 0);
            tl.to(state, { v: target, duration: 1, ease: 'power2.out',
              onUpdate: () => { dt.textContent = original.replace(match[0], String(Math.round(state.v))); },
              onComplete: () => { dt.textContent = original; dt.style.minWidth = ''; } }, factsAt + i * .12);
          });
          tl.from(q('.check-list li'), { opacity: .35, duration: .4, stagger: .18, clearProps: 'opacity' }, factsAt + .6)
            .from(q('.tick'), { scale: 0, transformOrigin: '50% 50%', duration: .45, stagger: .18, ease: 'back.out(3)', clearProps: 'transform' }, factsAt + .65);
        } else {
          tl.fromTo(q('.fact-grid dt'), { color: '#9fd3b8' }, { color: '#d98a4f', duration: .25, stagger: .08, yoyo: true, repeat: 1, clearProps: 'color' }, factsAt);
        }
      }
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
