import type { BillItem } from "./types";

export type getBillDataPayload = {
  initialTaxPercent?: number;
  initialServicePercent?: number;
  discountType?: "percent" | "amount";
  initialDiscountValue?: number;
  items?: BillItem[];
  initialSubtotal?: number;
};
