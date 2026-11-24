/**
 * The bill being worked on. Persisted to localStorage so a refresh, a camera
 * permission prompt or switching apps mid-split never loses the user's work
 * (the old flow passed everything through router state and lost it on reload).
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Bill, BillItem, Charges, Person } from "@/features/bill/types";
import { newId } from "@/lib/id";
import { todayIso } from "@/lib/date";

const emptyCharges = (): Charges => ({
  servicePercent: 0,
  taxPercent: 0,
  discount: { type: "amount", value: 0 },
});

export function newBill(partial: Partial<Bill> = {}): Bill {
  return {
    id: newId(),
    title: "",
    date: todayIso(),
    items: [],
    people: [],
    charges: emptyCharges(),
    source: "manual",
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

type DraftState = {
  draft: Bill | null;
  start: (bill: Bill) => void;
  clear: () => void;
  patch: (p: Partial<Pick<Bill, "title" | "date" | "receiptTotal">>) => void;
  setCharges: (c: Partial<Charges>) => void;
  addItem: () => string;
  updateItem: (id: string, p: Partial<Omit<BillItem, "id">>) => void;
  removeItem: (id: string) => void;
  restoreItem: (item: BillItem, index: number) => void;
  addPerson: (p: Omit<Person, "id"> & { id?: string }) => Person;
  removePerson: (id: string) => void;
  toggleAssignee: (itemId: string, personId: string) => void;
  assignEveryone: (itemId: string) => void;
  splitAllEqually: () => void;
};

const update = (set: (fn: (s: DraftState) => Partial<DraftState>) => void, fn: (b: Bill) => Bill) =>
  set((s) => (s.draft ? { draft: fn(s.draft) } : {}));

export const useDraft = create<DraftState>()(
  persist(
    (set, get) => ({
      draft: null,
      start: (bill) => set({ draft: bill }),
      clear: () => set({ draft: null }),
      patch: (p) => update(set, (b) => ({ ...b, ...p })),
      setCharges: (c) => update(set, (b) => ({ ...b, charges: { ...b.charges, ...c } })),
      addItem: () => {
        const id = newId();
        update(set, (b) => ({
          ...b,
          items: [...b.items, { id, name: "", quantity: 1, unitPrice: 0, assignees: [] }],
        }));
        return id;
      },
      updateItem: (id, p) =>
        update(set, (b) => ({ ...b, items: b.items.map((it) => (it.id === id ? { ...it, ...p } : it)) })),
      removeItem: (id) => update(set, (b) => ({ ...b, items: b.items.filter((it) => it.id !== id) })),
      restoreItem: (item, index) =>
        update(set, (b) => {
          const items = [...b.items];
          items.splice(Math.min(index, items.length), 0, item);
          return { ...b, items };
        }),
      addPerson: (p) => {
        const person: Person = { id: p.id ?? newId(), name: p.name.trim(), avatar: p.avatar };
        const existing = get().draft?.people.find((x) => x.id === person.id);
        if (existing) return existing;
        update(set, (b) => ({ ...b, people: [...b.people, person] }));
        return person;
      },
      removePerson: (id) =>
        update(set, (b) => ({
          ...b,
          people: b.people.filter((p) => p.id !== id),
          items: b.items.map((it) => ({ ...it, assignees: it.assignees.filter((a) => a !== id) })),
        })),
      toggleAssignee: (itemId, personId) =>
        update(set, (b) => ({
          ...b,
          items: b.items.map((it) =>
            it.id !== itemId
              ? it
              : {
                  ...it,
                  assignees: it.assignees.includes(personId)
                    ? it.assignees.filter((a) => a !== personId)
                    : [...it.assignees, personId],
                }
          ),
        })),
      assignEveryone: (itemId) =>
        update(set, (b) => {
          const all = b.people.map((p) => p.id);
          return {
            ...b,
            items: b.items.map((it) =>
              it.id !== itemId ? it : { ...it, assignees: it.assignees.length === all.length ? [] : all }
            ),
          };
        }),
      splitAllEqually: () =>
        update(set, (b) => ({ ...b, items: b.items.map((it) => ({ ...it, assignees: b.people.map((p) => p.id) })) })),
    }),
    { name: "splitto.draft.v1", storage: createJSONStorage(() => localStorage), version: 1 }
  )
);
