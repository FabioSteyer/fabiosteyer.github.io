import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
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
  const enterHooks: EnterHook[] = [];
  // Startdeckkraft .85 statt .65: Elemente unterhalb des sichtbaren Bereichs warten in
  // diesem Zustand auf ihren Einblend-Trigger. Bei .65 fiel gedaempfter Text dort auf
  // 4,19:1 und die Kupfer-Schrittmarke auf 3,31:1 (Lighthouse color-contrast,
  // 16.09.2026); bei .8 lag die Schrittmarke noch bei 4,38:1. Ab .85 halten beide 4,5:1.
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
  const setup = () => {
    context?.revert();
    context = undefined;
    if (disabled) return;
    context = gsap.context(() => {
      gsap.fromTo('.reading-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true } });
      // Gruppen (Kennzahlenreihe, die vier Schritte der Arbeitsweise) erscheinen
      // gestaffelt statt alle im selben Augenblick; Einzelelemente wie bisher.
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
      // Einstieg als Sequenz in eigener Zeit: Zeilen, dann die beiden Belege, dann
      // zeichnet sich die Kupferlinie vom Angebot zum Abgleich, zuletzt das Haekchen.
      // Vorher hing die Linie am Scrollweg des Hero und war beim Oeffnen schon zu
      // rund 60 % gezeichnet (gemessen 16.09.2026) - der Rest verschwand in wenigen
      // Pixeln Scroll. Bei Ankersprung oder bereits gescrollter Seite bleibt alles statisch.
      const connector = document.querySelector<SVGPathElement>('.art-connector path');
      const connectorLength = connector?.getTotalLength() ?? 0;
      if (!window.location.hash && window.scrollY < 50) {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.from('.hero-line', { y: 20, opacity: .5, stagger: .09, duration: .8, clearProps: 'transform,opacity' }, 0)
          .from('.doc-back', { x: -30, rotation: -3, duration: 1.1 }, 0)
          .from('.doc-front', { y: 45, rotation: 3, duration: 1 }, .1);
        if (connector) intro.fromTo(connector, { strokeDasharray: connectorLength, strokeDashoffset: connectorLength }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, .75);
        intro.from('.art-connector circle', { scale: 0, transformOrigin: '50% 50%', duration: .35, ease: 'back.out(2)' }, 1.7)
          .from('.art-check', { y: 15, opacity: 0, duration: .5, clearProps: 'transform,opacity' }, 1.8);
      }
      // Hero verlaesst den Bildschirm im Raum: die Belege kippen und faechern auf,
      // waehrend die Kennzahlenreihe darunter wie ein Blatt aufgerichtet wird.
      const mobile = window.innerWidth < 761;
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } })
        .to('.hero-art', { y: mobile ? -40 : -90, rotateY: mobile ? -18 : -40, rotateX: mobile ? 6 : 14, transformPerspective: 1000, ease: 'none' }, 0)
        .to('.doc-front', { rotateY: -24, x: -40, z: 60, transformPerspective: 900, ease: 'none' }, 0)
        .to('.doc-back', { rotateY: 26, x: 36, ease: 'none' }, 0)
        .to('.hero-copy', { y: -30, opacity: .55, ease: 'none' }, 0);
      // Deckkraft nicht unter .92: sie multipliziert sich mit der .85 der Einblendung
      // (data-reveal), und darunter faellt die Kupfer-Schrittmarke unter 4,5:1.
      // Abschnittswechsel als Blatt im Raum: jeder Abschnitt liegt beim Hereinscrollen
      // nach hinten (Unterkante weg vom Betrachter) und richtet sich auf; beim Verlassen
      // kippt er an der Unterkante nach hinten weg. Beide Winkel zeigen von der
      // Betrachterin weg: Kanten, die naeher kaemen, wuerden perspektivisch breiter
      // projiziert und die Seite seitlich ueberlaufen lassen (gemessen: 1.778 px bei
      // 1.440 px Fenster mit +16 Grad). An den Scrollweg gebunden, ohne Festhalten.
      gsap.utils.toArray<HTMLElement>('.metrics, main .section').forEach(sheet => {
        const vh = window.innerHeight;
        const total = sheet.offsetHeight + vh;
        const enter = Math.min(.45, (vh * .5) / total);
        const leave = Math.min(.35, (vh * .4) / total);
        gsap.timeline({ scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'bottom top', scrub: .6 } })
          .fromTo(sheet, { rotateX: mobile ? -8 : -16, y: mobile ? 32 : 72, opacity: .92, transformOrigin: '50% 0%', transformPerspective: 1100 }, { rotateX: 0, y: 0, opacity: 1, duration: enter, ease: 'power1.out', force3D: false }, 0)
          .to(sheet, { rotateX: mobile ? -5 : -9, y: mobile ? -16 : -32, opacity: .9, transformOrigin: '50% 100%', duration: leave, ease: 'power1.in', force3D: false }, 1 - leave);
      });
      // Die beiden Beispielflaechen schwingen wie an einem Scharnier in die Leseebene:
      // die erste an der linken, die zweite an der rechten Kante, die freie Kante jeweils
      // vom Betrachter weg (kein seitlicher Ueberlauf).
      gsap.utils.toArray<HTMLElement>('.project .demo').forEach((demo, index) => {
        gsap.from(demo, { rotateY: 22, x: index ? -50 : 50, transformOrigin: index ? '100% 50%' : '0% 50%', transformPerspective: 1200, ease: 'none', scrollTrigger: { trigger: demo, start: 'top 95%', end: 'top 45%', scrub: .6 } });
      });
      document.querySelectorAll<SVGPathElement>('.flow-draw').forEach(path => {
        const length = path.getTotalLength();
        gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: path.closest('div'), start: 'top 90%', end: 'bottom 25%', scrub: .7 } });
      });
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
