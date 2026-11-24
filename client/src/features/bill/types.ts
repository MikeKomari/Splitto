/** All money is integer Rupiah. No floats are stored, only derived. */
export type Money = number;

export type BillItem = {
  id: string;
  name: string;
  quantity: number;
  /** Price of one unit, integer Rupiah. */
  unitPrice: Money;
  /** People sharing this line. Line cost is split equally between them. */
  assignees: string[];
};

export type Person = {
  id: string;
  name: string;
  /** Index into /profile/profile1/{n}.png */
  avatar: number;
};

export type Discount = { type: "amount" | "percent"; value: number };

export type Charges = {
  /** Service charge %, applied to (items − discount). */
  servicePercent: number;
  /** Tax % (PB1/PPN), applied to (items − discount + service). */
  taxPercent: number;
  discount: Discount;
};

export type Bill = {
  id: string;
  title: string;
  /** yyyy-mm-dd */
  date: string;
  items: BillItem[];
  people: Person[];
  charges: Charges;
  source: "scan" | "manual";
  /** Total printed on the receipt, used only to flag mismatches. */
  receiptTotal?: Money;
  createdAt: string;
};
