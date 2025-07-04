export type BillItem = {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
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
};

export type Person = {
  id: string;
  name: string;
  avatar: string;
  total: number;
};
