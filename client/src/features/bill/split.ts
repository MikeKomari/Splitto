/**
 * Bill-splitting maths. Pure and deterministic.
 *
 * Rules (also in design.md):
 *  1. A line's cost is split equally between the people assigned to it.
 *  2. Discount comes off the items total first.
 *  3. Service = service% × (items − discount).
 *  4. Tax     = tax% × (items − discount + service)   (PB1 is charged on service too).
 *  5. Discount, service and tax are shared in proportion to each person's items.
 *
 * Every figure is whole Rupiah. Splits use the largest-remainder method, so
 * per-person amounts always add up EXACTLY to the bill total: nobody is
 * left covering a stray Rp 1 from rounding.
 */
import type { Bill, BillItem, Charges, Money } from "./types";

/** Split `total` into integers proportional to `weights`, summing to `total`. */
export function allocate(total: Money, weights: number[]): Money[] {
  const sumW = weights.reduce((a, b) => a + b, 0);
  if (total === 0 || sumW <= 0) return weights.map(() => 0);
  const sign = total < 0 ? -1 : 1;
  const abs = Math.abs(total);
  const raw = weights.map((w) => (abs * w) / sumW);
  const floors = raw.map(Math.floor);
  let rest = abs - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) floors[order[k].i] += 1;
  return floors.map((v) => v * sign);
}

export const lineTotal = (item: Pick<BillItem, "quantity" | "unitPrice">) =>
  Math.round(item.quantity * item.unitPrice);

export type ChargeTotals = {
  itemsTotal: Money;
  discount: Money;
  service: Money;
  tax: Money;
  grandTotal: Money;
};

export function chargeTotals(items: BillItem[], charges: Charges): ChargeTotals {
  const itemsTotal = items.reduce((s, it) => s + lineTotal(it), 0);
  const rawDiscount =
    charges.discount.type === "percent"
      ? (itemsTotal * clampPct(charges.discount.value)) / 100
      : charges.discount.value;
  const discount = Math.round(Math.min(Math.max(rawDiscount, 0), itemsTotal));
  const base = itemsTotal - discount;
  const service = Math.round((base * clampPct(charges.servicePercent)) / 100);
  const tax = Math.round(((base + service) * clampPct(charges.taxPercent)) / 100);
  return { itemsTotal, discount, service, tax, grandTotal: base + service + tax };
}

export type PersonShare = {
  personId: string;
  lines: Array<{ itemId: string; name: string; amount: Money; sharedWith: number; quantity: number }>;
  items: Money;
  discount: Money;
  service: Money;
  tax: Money;
  total: Money;
};

export type SplitResult = ChargeTotals & {
  people: PersonShare[];
  /** Cost of lines nobody is assigned to yet. */
  unassigned: Money;
  unassignedCount: number;
};

export function computeSplit(bill: Pick<Bill, "items" | "people" | "charges">): SplitResult {
  const totals = chargeTotals(bill.items, bill.charges);
  const index = new Map(bill.people.map((p, i) => [p.id, i]));
  const shares: PersonShare[] = bill.people.map((p) => ({
    personId: p.id,
    lines: [],
    items: 0,
    discount: 0,
    service: 0,
    tax: 0,
    total: 0,
  }));

  let unassigned = 0;
  let unassignedCount = 0;
  for (const item of bill.items) {
    const who = item.assignees.filter((id) => index.has(id));
    const cost = lineTotal(item);
    if (who.length === 0) {
      unassigned += cost;
      unassignedCount += 1;
      continue;
    }
    const parts = allocate(cost, who.map(() => 1));
    who.forEach((id, k) => {
      const s = shares[index.get(id)!];
      s.items += parts[k];
      s.lines.push({ itemId: item.id, name: item.name, amount: parts[k], sharedWith: who.length, quantity: item.quantity });
    });
  }

  // Extras are shared in proportion to what each person ordered. When some
  // lines are still unassigned, only the assigned part of the extras is
  // handed out (the rest belongs to whoever ends up with those lines).
  const assignedItems = totals.itemsTotal - unassigned;
  const portion = (amount: Money) =>
    totals.itemsTotal === 0 ? 0 : Math.round((amount * assignedItems) / totals.itemsTotal);
  const weights = shares.map((s) => s.items);
  const disc = allocate(portion(totals.discount), weights);
  const svc = allocate(portion(totals.service), weights);
  const tax = allocate(portion(totals.tax), weights);
  shares.forEach((s, i) => {
    s.discount = disc[i];
    s.service = svc[i];
    s.tax = tax[i];
    s.total = s.items - s.discount + s.service + s.tax;
  });

  return { ...totals, people: shares, unassigned, unassignedCount };
}

function clampPct(v: number) {
  return Number.isFinite(v) ? Math.min(Math.max(v, 0), 100) : 0;
}
