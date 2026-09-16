// Deliberately small, synthetic examples. This is not the Python PDF parser.
export const invoiceCases = {
  price: { quote: { quantity: 120, packSize: 1, priceCents: 200 }, deliveries: [{ quantity: 120, packSize: 1, priceCents: 220 }] },
  split: { quote: { quantity: 120, packSize: 1, priceCents: 200 }, deliveries: [{ quantity: 70, packSize: 1, priceCents: 200 }, { quantity: 50, packSize: 1, priceCents: 200 }] },
  units: { quote: { quantity: 12, packSize: 10, priceCents: 2000 }, deliveries: [{ quantity: 120, packSize: 1, priceCents: 200 }] },
};

export function reconcile({ quote, deliveries }) {
  const quantity = deliveries.reduce((sum, line) => sum + line.quantity * line.packSize, 0);
  const expectedCents = Math.round(quantity * quote.priceCents / quote.packSize);
  const actualCents = deliveries.reduce((sum, line) => sum + line.quantity * line.priceCents, 0);
  return { expectedCents, actualCents, differenceCents: actualCents - expectedCents, quantity };
}

export function writeTrace(coordinated) {
  const processes = ['A', 'B', 'C', 'D'];
  const snapshots = new Map();
  const trace = [];
  let stored = [];
  const read = process => {
    snapshots.set(process, [...stored]);
    trace.push({ process, action: 'read', snapshot: [...stored], stored: [...stored] });
  };
  const write = process => {
    stored = [...snapshots.get(process), process];
    trace.push({ process, action: 'write', snapshot: [...snapshots.get(process)], stored: [...stored] });
  };
  if (coordinated) processes.forEach(process => { read(process); write(process); });
  else { processes.forEach(read); processes.forEach(write); }
  return trace;
}
