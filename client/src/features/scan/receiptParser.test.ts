import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAmount, parseReceipt } from "./receiptParser";

/** Real Tesseract output from the sample photos in model/SampleData.zip. */
const fixture = (name: string) => readFileSync(join(__dirname, "__fixtures__", `${name}.txt`), "utf8");

describe("parseAmount", () => {
  it.each([
    ["35,000", 35000],
    ["116, 000", 116000],
    ["1.250.000", 1250000],
    ["25.000,00", 25000],
    ["Rp28500", 28500],
    ["Re 36000", 36000],
    ["(9.000)", -9000],
    ["-14950", -14950],
  ])("%s → %d", (raw, expected) => expect(parseAmount(raw)).toBe(expected));

  it("rejects phone numbers and ids", () => {
    expect(parseAmount("081285593639")).toBeNull();
    expect(parseAmount("000000")).toBeNull();
  });
});

describe("parseReceipt on a clean receipt", () => {
  const text = `WARUNG SENJA
Jl. Kebon Jeruk 21
Kasir: Rina 12/06/2025 19:02
2x @25.000 50.000
Nasi Goreng
1x @18.000 18.000
Es Teh Manis
Subtotal 68.000
Service 5% 3.400
PB1 10% 7.140
Total 78.540`;

  it("reads items, charges and reconciles", () => {
    const r = parseReceipt(text);
    expect(r.items).toEqual([
      { name: "Nasi Goreng", quantity: 2, unitPrice: 25000 },
      { name: "Es Teh Manis", quantity: 1, unitPrice: 18000 },
    ]);
    expect(r).toMatchObject({ subtotal: 68000, service: 3400, tax: 7140, total: 78540, taxInclusive: false });
    expect(r.check).toMatchObject({ against: "subtotal", matches: true });
  });

  it("picks the name line BEFORE qty lines when that fits better", () => {
    const r = parseReceipt(`Kasir 1 10:00\nChicken Katsu Curry Udon\n2x @63.000 126.000\nCold Ocha\n2x @16.000 32.000\nGrand Total : 158.000`);
    expect(r.items.map((i) => i.name)).toEqual(["Chicken Katsu Curry Udon", "Cold Ocha"]);
    expect(r.check.matches).toBe(true);
    expect(r.taxInclusive).toBe(true);
  });
});

describe("parseReceipt on real OCR output", () => {
  it("IMG_0665: qty-first single-line layout", () => {
    const r = parseReceipt(fixture("IMG_0665"));
    expect(r.items).toEqual([
      { name: "Katsu & Chick Batubara", quantity: 1, unitPrice: 35000 },
      { name: "chick Grill Batubara", quantity: 3, unitPrice: 25000 },
      { name: "Es Teh Tawar", quantity: 3, unitPrice: 2000 },
    ]);
    expect(r.check.matches).toBe(true);
  });

  it("IMG_0668: minimarket layout with vouchers and merged qty digits", () => {
    const r = parseReceipt(fixture("IMG_0668"));
    expect(r.items.map((i) => [i.quantity, i.unitPrice])).toEqual([
      [3, 21600],
      [3, 5900],
      [3, 9500],
      [15, 8000],
    ]);
    expect(r.discount).toBe(13500);
    expect(r.total).toBe(217500);
    expect(r.check.matches).toBe(true);
  });

  it("IMG_0669 and IMG_0671: '@' read as a digit, still reconciles", () => {
    for (const f of ["IMG_0669", "IMG_0671"]) expect(parseReceipt(fixture(f)).check.matches).toBe(true);
  });

  it("flags receipts it could not fully read instead of pretending", () => {
    const r = parseReceipt(fixture("IMG_0663"));
    expect(r.check.matches).toBe(false);
    expect(r.items.length).toBeGreaterThan(0);
  });
});
