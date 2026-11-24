import { describe, expect, it } from "vitest";
import { allocate, chargeTotals, computeSplit } from "./split";
import type { Bill } from "./types";

const people = [
  { id: "a", name: "A", avatar: 1 },
  { id: "b", name: "B", avatar: 2 },
  { id: "c", name: "C", avatar: 3 },
];
const noCharges = { servicePercent: 0, taxPercent: 0, discount: { type: "amount" as const, value: 0 } };

describe("allocate", () => {
  it("never loses or invents a rupiah", () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(10_000, [1, 2, 3]).reduce((a, b) => a + b)).toBe(10_000);
    expect(allocate(0, [1, 2])).toEqual([0, 0]);
    expect(allocate(5, [0, 0])).toEqual([0, 0]);
  });
});

describe("chargeTotals", () => {
  it("applies discount, then service, then tax on service", () => {
    const t = chargeTotals([{ id: "1", name: "x", quantity: 2, unitPrice: 50_000, assignees: [] }], {
      discount: { type: "percent", value: 10 },
      servicePercent: 5,
      taxPercent: 10,
    });
    expect(t).toEqual({ itemsTotal: 100_000, discount: 10_000, service: 4_500, tax: 9_450, grandTotal: 103_950 });
  });

  it("caps an amount discount at the items total", () => {
    const t = chargeTotals([{ id: "1", name: "x", quantity: 1, unitPrice: 5_000, assignees: [] }], {
      ...noCharges,
      discount: { type: "amount", value: 9_000 },
    });
    expect(t.grandTotal).toBe(0);
  });
});

describe("computeSplit", () => {
  const bill: Pick<Bill, "items" | "people" | "charges"> = {
    people,
    charges: { servicePercent: 5, taxPercent: 10, discount: { type: "amount", value: 0 } },
    items: [
      { id: "i1", name: "Pizza", quantity: 1, unitPrice: 100_000, assignees: ["a", "b", "c"] },
      { id: "i2", name: "Tea", quantity: 2, unitPrice: 5_000, assignees: ["a"] },
    ],
  };

  it("per-person totals add up exactly to the grand total", () => {
    const r = computeSplit(bill);
    expect(r.unassigned).toBe(0);
    expect(r.people.reduce((s, p) => s + p.total, 0)).toBe(r.grandTotal);
    expect(r.people.map((p) => p.items)).toEqual([43_334, 33_333, 33_333]);
  });

  it("reports unassigned lines", () => {
    const r = computeSplit({ ...bill, items: [...bill.items, { id: "i3", name: "Cake", quantity: 1, unitPrice: 20_000, assignees: [] }] });
    expect(r.unassigned).toBe(20_000);
    expect(r.unassignedCount).toBe(1);
  });

  it("ignores assignees who were removed from the bill", () => {
    const r = computeSplit({ ...bill, people: people.slice(0, 2) });
    expect(r.people.reduce((s, p) => s + p.items, 0)).toBe(110_000);
  });

  it("handles a bill with no charges", () => {
    const r = computeSplit({ ...bill, charges: noCharges });
    expect(r.grandTotal).toBe(110_000);
  });
});
