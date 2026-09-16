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
      if (!window.location.hash && window.scrollY < 50) {
        gsap.from('.hero-line', { y: 20, opacity: .5, stagger: .09, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity' });
        gsap.from('.doc-back', { x: -30, rotation: -3, duration: 1.1, ease: 'power3.out' });
        gsap.from('.doc-front', { y: 45, rotation: 3, duration: 1, delay: .1, ease: 'power3.out' });
        gsap.from('.art-check', { y: 15, opacity: 0, delay: .6, duration: .5, clearProps: 'transform,opacity' });
      }
      gsap.to('.hero-art', { y: -25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
      document.querySelectorAll<SVGPathElement>('.flow-draw,.art-connector path').forEach(path => {
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
