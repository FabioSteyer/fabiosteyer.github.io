import { invoiceCases, reconcile, writeTrace } from '../lib/demo-model.mjs';

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
let manuallyReduced = false;
let motion: Awaited<ReturnType<typeof import('./portfolio-motion')['createMotion']>> | undefined;
const reduced = () => manuallyReduced || preference.matches;
const select = <T extends Element = HTMLElement>(root: ParentNode, selector: string) => root.querySelector<T>(selector)!;
type Motion = NonNullable<typeof motion>;
// Wird abgearbeitet, sobald das optionale Animationsmodul geladen ist.
const onMotion: ((motion: Motion) => void)[] = [];
const text = (root: ParentNode, selector: string, value: string) => { select(root, selector).textContent = value; };

document.querySelectorAll<HTMLElement>('[data-invoice]').forEach(root => {
  const de = root.dataset.lang === 'de';
  const money = (cents: number) => new Intl.NumberFormat(de ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  root.querySelectorAll<HTMLButtonElement>('[data-case]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.case as keyof typeof invoiceCases;
      const data = invoiceCases[key];
      const result = reconcile(data);
      root.querySelectorAll('[data-case]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      text(root, '[data-quote-line]', key === 'units' ? (de ? '12 Zehnerpacks × ' : '12 packs of 10 × ') + money(2000) : '120 × ' + money(200));
      text(root, '[data-quote-total]', money(data.quote.quantity * data.quote.priceCents));
      text(root, '[data-invoice-title]', key === 'split' ? (de ? 'Zwei Rechnungen' : 'Two invoices') : (de ? 'Rechnung' : 'Invoice'));
      text(root, '[data-invoice-line]', key === 'split' ? '(70 + 50) × ' + money(200) : '120 × ' + money(key === 'price' ? 220 : 200));
      text(root, '[data-invoice-total]', money(result.actualCents));
      const output = select<HTMLElement>(root, '[data-invoice-result]');
      output.dataset.state = result.differenceCents ? 'difference' : 'match';
      text(output, '[data-result-icon]', result.differenceCents ? '!' : '✓');
      text(output, '[data-result-title]', key === 'price' ? money(result.differenceCents) + (de ? ' zu viel berechnet' : ' overcharged') : (de ? 'Passt. Keine Abweichung.' : 'Matches. No discrepancy.'));
      const reason = key === 'price'
        ? (de ? '120 Stück × 0,20 € Preisdifferenz. Dieselbe Position, ein anderer Preis.' : '120 pieces × €0.20 price difference. The same item, a different price.')
        : key === 'split'
          ? (de ? '70 + 50 = 120 Stück. Zwei Lieferungen ergeben die vereinbarte Menge und denselben Gesamtpreis.' : '70 + 50 = 120 pieces. Two deliveries add up to the agreed quantity and total price.')
          : (de ? '12 Zehnerpacks = 120 Stück. Erst die Einheit umrechnen, dann den Preis vergleichen.' : '12 packs of 10 = 120 pieces. Normalize the unit before comparing the price.');
      text(output, '[data-result-reason]', reason);
      motion?.invoice(root);
    });
  });
  select<HTMLElement>(root, '[data-controls]').hidden = false;
  onMotion.push(motion => motion.onEnter(root, () => motion.invoice(root)));
});

document.querySelectorAll<HTMLElement>('[data-concurrency]').forEach(root => {
  const de = root.dataset.lang === 'de';
  let coordinated = false;
  const renderStored = (stored: string[]) => {
    root.querySelectorAll<HTMLElement>('[data-entry]').forEach(entry => entry.classList.toggle('lost', !stored.includes(entry.dataset.entry!)));
    select(root, '[data-file-entries]').setAttribute('aria-label', (de ? 'Erhaltene Einträge: ' : 'Retained entries: ') + (stored.join(', ') || (de ? 'keine' : 'none')));
  };
  const finish = () => {
    root.querySelectorAll<HTMLElement>('[data-process]').forEach(process => {
      process.dataset.active = 'false';
      text(process, '[data-process-state]', de ? 'geschrieben' : 'written');
    });
    renderStored(writeTrace(coordinated).at(-1)!.stored);
  };
  const run = () => {
    const trace = writeTrace(coordinated);
    root.querySelectorAll<HTMLElement>('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.mode === 'safe') === coordinated)));
    text(root, '[data-bridge-label]', coordinated ? (de ? 'LESEN → SCHREIBEN → FREIGEBEN' : 'READ → WRITE → RELEASE') : (de ? 'GLEICHER ALTER STAND' : 'SAME STALE SNAPSHOT'));
    const output = select<HTMLElement>(root, '[data-write-result]');
    output.dataset.state = coordinated ? 'match' : 'difference';
    text(output, '[data-result-icon]', coordinated ? '✓' : '!');
    text(output, '[data-result-title]', coordinated ? (de ? '4 von 4 Einträgen bleiben.' : '4 of 4 entries survive.') : (de ? '1 von 4 Einträgen bleibt.' : '1 of 4 entries survives.'));
    text(output, '[data-result-reason]', coordinated ? (de ? 'Ein Prozess nach dem anderen. Jeder liest den Stand, den sein Vorgänger gespeichert hat.' : 'One process at a time. Each reads the state saved by its predecessor.') : (de ? 'Alle lesen denselben alten Stand. Jeder überschreibt die Einträge der anderen.' : 'All read the same old state. Each overwrites the other processes’ entries.'));
    if (motion && !reduced()) {
      motion.writes(root, trace, event => {
        root.querySelectorAll<HTMLElement>('[data-process]').forEach(process => {
          const active = process.dataset.process === event.process;
          process.dataset.active = String(active);
          if (active) text(process, '[data-process-state]', event.action === 'read' ? (de ? 'liest' : 'reading') : (de ? 'schreibt' : 'writing'));
        });
        renderStored(event.stored);
      }, finish);
    } else finish();
  };
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', () => {
    coordinated = button.dataset.mode === 'safe';
    run();
  }));
  select<HTMLButtonElement>(root, '[data-replay]').addEventListener('click', run);
  select<HTMLElement>(root, '[data-controls]').hidden = false;
  select<HTMLElement>(root, '[data-replay]').hidden = false;
  // Beim ersten Sichtbarwerden laeuft der Ablauf einmal von selbst (nicht bei
  // reduzierter Bewegung, dann steht das Endergebnis wie bisher sofort da).
  onMotion.push(motion => motion.onEnter(root, run));
});

// Panels der Projekte 3 bis 5: beim ersten Sichtbarwerden voller Aufbau, bei jedem
// weiteren Eintritt (zurueck- oder weitergescrollt) nur die Bewegungsakzente, damit
// Text und Zahlen beim erneuten Lesen nicht verschwinden. Der Knopf wiederholt alles.
document.querySelectorAll<HTMLElement>('[data-panel]').forEach(root => {
  const replay = root.querySelector<HTMLButtonElement>('[data-panel-replay]');
  replay?.addEventListener('click', () => motion?.panel(root, 'full'));
  onMotion.push(motion => {
    if (replay) replay.hidden = false;
    motion.onEnter(root, () => motion.panel(root, 'full'));
    motion.onReturn(root, () => motion.panel(root, 'light'));
  });
});

const toggle = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
const syncPreference = () => {
  document.documentElement.dataset.reducedMotion = String(reduced());
  toggle?.setAttribute('aria-pressed', String(reduced()));
  motion?.setReduced(reduced());
};
toggle?.addEventListener('click', () => {
  // An OS-level preference always wins. This control can only reduce motion further.
  manuallyReduced = !manuallyReduced;
  syncPreference();
});
preference.addEventListener('change', syncPreference);
if (toggle) {
  toggle.hidden = false;
  toggle.disabled = preference.matches;
  preference.addEventListener('change', () => { toggle.disabled = preference.matches; });
}
syncPreference();

// Behavior does not depend on the optional animation bundle loading successfully.
// Geladen, sobald der Hauptthread frei ist (Lighthouse 22.09.2026: 190-250 ms
// Blockierzeit, wenn das Buendel sofort startet); spaetestens nach 1,5 s.
const loadMotion = () => import('./portfolio-motion').then(({ createMotion }) => {
  motion = createMotion(reduced());
  onMotion.forEach(register => register(motion!));
}).catch(() => { /* The static layout and both examples remain fully usable. */ });
if ('requestIdleCallback' in window) requestIdleCallback(() => { loadMotion(); }, { timeout: 1500 });
else setTimeout(loadMotion, 200);

document.querySelectorAll('details').forEach(details => {
  details.addEventListener('toggle', () => motion?.refresh());
});

// Kopfzeile bekommt nach dem ersten Scrollen einen leichten Schatten.
const topbar = document.querySelector<HTMLElement>('[data-topbar]');
if (topbar) {
  const syncTopbar = () => topbar.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', syncTopbar, { passive: true });
  syncTopbar();
}

const sections = document.querySelectorAll<HTMLElement>('main section[id]');
if ('IntersectionObserver' in window) {
  let observer: IntersectionObserver;
  const observeSections = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll<HTMLAnchorElement>('.nav a[href^="#"]').forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-' + Math.round(innerHeight * .15) + 'px 0px -' + Math.round(innerHeight * .65) + 'px 0px' });
    sections.forEach(section => observer.observe(section));
  };
  observeSections();
  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(observeSections);
  });
}
