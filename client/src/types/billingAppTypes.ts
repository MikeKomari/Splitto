import type { BillItem } from "./types";

export type getBillDataPayload = {
  taxPercent?: number;
  servicePercent?: number;
  discountType?: "percent" | "amount";
  discountValue?: number;
  items?: BillItem[];
  subtotal?: number;
};
