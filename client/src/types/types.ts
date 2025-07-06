export type BillItem = {
  id: number;
  item_name: string;
  pricePerUnit: number;
  quantity: number;
  assignedTo: number[]; // Use number for initial profiles, string for database IDs
};

export type PersonInBill = {
  id: number; // Use number for initial profiles, string for database IDs
  name: string;
  avatar: string;
  total: number;
};

export type Bill = {
  id: string;
  name: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  peopleCount: number;
  participants: PersonInBill[];
};

export type Person = {
  id: string;
  name: string;
  avatar: string;
  total: number;
  Bills: Bill[];
};
