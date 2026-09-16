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
    assert.match(html, /<h1\b/);
    assert.doesNotMatch(html, /Physicist \(M.Sc., TU Berlin\)|Physiker \(M.Sc., TU Berlin\)/);
  }
});
