import test from 'node:test';
import assert from 'node:assert/strict';
import { invoiceCases, reconcile, writeTrace } from '../src/lib/demo-model.mjs';

test('a changed unit price produces the exact monetary difference', () => {
  assert.deepEqual(reconcile(invoiceCases.price), { expectedCents: 24000, actualCents: 26400, differenceCents: 2400, quantity: 120 });
});
test('partial deliveries add up without a false alarm', () => {
  assert.equal(invoiceCases.split.deliveries.length, 2);
  assert.deepEqual(reconcile(invoiceCases.split), { expectedCents: 24000, actualCents: 24000, differenceCents: 0, quantity: 120 });
});
test('prices per pack normalize to the same per-piece total', () => {
  assert.equal(invoiceCases.units.quote.packSize, 10);
  assert.deepEqual(reconcile(invoiceCases.units), { expectedCents: 24000, actualCents: 24000, differenceCents: 0, quantity: 120 });
});
test('uncoordinated writers retain only the final stale snapshot', () => {
  const trace = writeTrace(false);
  assert.equal(trace.length, 8);
  assert.deepEqual(trace.filter(e => e.action === 'read').map(e => e.snapshot), [[], [], [], []]);
  assert.deepEqual(trace.at(-1).stored, ['D']);
});
test('serialized writers preserve every preceding write', () => {
  const trace = writeTrace(true);
  assert.equal(trace.length, 8);
  assert.deepEqual(trace.map(e => e.action), ['read','write','read','write','read','write','read','write']);
  assert.deepEqual(trace.at(-1).stored, ['A','B','C','D']);
  assert.deepEqual(trace[1].stored, ['A'], 'later writes must not mutate earlier trace snapshots');
});
