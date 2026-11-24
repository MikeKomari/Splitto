/**
 * Optional paid fallback: the original LLM endpoint (server POST /api/split; VITE_BE_LINK should point at .../api).
 * Off by default. Enable with VITE_AI_SCAN=true when the server has an
 * OPENAI_API_KEY. The UI only offers it when free OCR could not reconcile,
 * so you pay for the hard receipts, not every receipt.
 */
import { API } from "@/services/API";
import type { ParsedReceipt } from "./receiptParser";

export const aiScanEnabled = import.meta.env.VITE_AI_SCAN === "true";

type AiResponse = {
  items: Array<{ item_name: string; quantity: number; pricePerUnit: number }>;
  subtotals?: {
    subtotal?: number;
    grand_totals?: number;
    add_charges?: { PB1?: number; service_charge?: number };
    discount?: { discount_total?: number };
  };
};

export async function aiScan(file: Blob): Promise<ParsedReceipt> {
  const form = new FormData();
  form.append("file", file, "receipt.jpg");
  const { data } = await API.post<AiResponse>("/split", form, { timeout: 60_000 });
  const items = (data.items ?? [])
    .filter((i) => i.item_name && i.pricePerUnit > 0)
    .map((i) => ({
      name: i.item_name,
      quantity: Math.max(1, Math.round(i.quantity || 1)),
      unitPrice: Math.round(i.pricePerUnit),
    }));
  const s = data.subtotals ?? {};
  const itemsSum = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);
  return {
    items,
    subtotal: s.subtotal || undefined,
    total: s.grand_totals || undefined,
    tax: s.add_charges?.PB1 || undefined,
    service: s.add_charges?.service_charge || undefined,
    discount: s.discount?.discount_total || undefined,
    taxInclusive: false,
    check: {
      itemsSum,
      against: s.subtotal ? "subtotal" : undefined,
      expected: s.subtotal || undefined,
      matches: !!s.subtotal && s.subtotal === itemsSum,
    },
  };
}
