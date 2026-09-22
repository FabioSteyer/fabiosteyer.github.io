import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
const assetFiles = await readdir(new URL('_astro/', output));
const styles = (await Promise.all(assetFiles.filter(f => f.endsWith('.css'))
  .map(f => readFile(new URL('_astro/' + f, output), 'utf8')))).join('\n');

test('the shipped animation library retains its copyright and license notices', async () => {
  const file = assetFiles.find(f => f.startsWith('portfolio-motion.') && f.endsWith('.js'));
  assert.ok(file, 'the animation bundle exists');
  const script = await readFile(new URL('_astro/' + file, output), 'utf8');
  assert.ok(script.includes('Copyright 2008-2026, GreenSock'), 'preserve the upstream copyright');
  assert.ok(script.includes('https://gsap.com/standard-license'), 'preserve the upstream license link');
});

test('production CSS never combines timeline values into unsupported animation shorthand', () => {
  assert.doesNotMatch(styles, /(?:^|[;{])animation:[^;}]*?(?:view\(|scroll\(|--page|--card)/);
});

test('privacy statements describe the interactive site truthfully', async () => {
  for (const path of ['datenschutz/index.html', 'en/privacy/index.html']) {
    const html = await readFile(new URL(path, output), 'utf8');
    assert.doesNotMatch(html, /Kein clientseitiges JavaScript|No client-side JavaScript/);
    assert.match(html, /JavaScript/);
  }
});

test('both languages keep noindex, project destinations and real text evidence', async () => {
  for (const path of ['index.html', 'en/index.html']) {
    const html = await readFile(new URL(path, output), 'utf8');
    assert.match(html, /noindex/);
    assert.match(html, /github.com\/FabioSteyer\/invoice-quote-reconciliation/);
    assert.match(html, /github.com\/FabioSteyer\/concurrent-file-writes/);
    assert.match(html, /github.com\/FabioSteyer\/prose-check-chain/);
    assert.match(html, /github.com\/FabioSteyer\/gated-routine-runner/);
    assert.match(html, /github.com\/FabioSteyer\/pos-reorder-proposal/);
    assert.match(html, /github.com\/FabioSteyer\/fabiosteyer.github.io/);
    assert.match(html, /<h1\b/);
    assert.doesNotMatch(html, /Physicist \(M.Sc., TU Berlin\)|Physiker \(M.Sc., TU Berlin\)/);
  }
});

test('every content page shares the same header, navigation and footer shell', async () => {
  const pages = ['index.html', 'en/index.html', 'ueber-mich/index.html', 'en/about/index.html', 'impressum/index.html', 'datenschutz/index.html', 'en/legal-notice/index.html', 'en/privacy/index.html'];
  for (const path of pages) {
    const html = await readFile(new URL(path, output), 'utf8');
    assert.match(html, /<header class="topbar"/, path + ' has the shared header');
    assert.match(html, /class="about-link"/, path + ' links to the evidence page');
    assert.match(html, /class="language"/, path + ' has the language switch');
    assert.match(html, /<footer class="footer wrap"/, path + ' has the shared footer');
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path + ' has exactly one h1');
  }
  const home = await readFile(new URL('index.html', output), 'utf8');
  const about = await readFile(new URL('ueber-mich/index.html', output), 'utf8');
  assert.match(home, /href="#projekte"/);
  assert.match(about, /href="\/#projekte"/);
  assert.match(about, /aria-current="page"/);
  assert.doesNotMatch(about, /data-motion-toggle/, 'pages without scripts do not show the motion control');
});
