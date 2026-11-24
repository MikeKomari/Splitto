import type { Bill } from "@/features/bill/types";
import { newBill } from "@/store/draftStore";
import { newId } from "@/lib/id";
import type { ParsedReceipt } from "./receiptParser";

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Receipt amounts → editable bill. Service and tax are stored as percentages
 * (what people see printed and want to tweak), derived from the amounts with
 * the same order of operations as split.ts uses to rebuild them.
 */
export function receiptToBill(r: ParsedReceipt, people: Bill["people"] = []): Bill {
  const itemsTotal = r.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const discount = Math.min(r.discount ?? 0, itemsTotal);
  const base = itemsTotal - discount;
  const service = r.service ?? 0;
  const tax = r.taxInclusive ? 0 : (r.tax ?? 0);
  return newBill({
    source: "scan",
    people,
    receiptTotal: r.total,
    items: r.items.map((it) => ({ id: newId(), ...it, assignees: [] })),
    charges: {
      discount: { type: "amount", value: discount },
      servicePercent: base > 0 ? round1((service / base) * 100) : 0,
      taxPercent: base + service > 0 ? round1((tax / (base + service)) * 100) : 0,
    },
  });
}
