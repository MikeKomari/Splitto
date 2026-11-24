/**
 * Finished bills and the friends you split with, kept on this device only.
 * There is no account system yet; when one lands, this becomes a sync cache.
 *
 * saveBill is an upsert keyed by bill id, so saving the same bill twice
 * (double tap, revisiting the summary) never creates a duplicate.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Bill, Person } from "@/features/bill/types";
import { computeSplit } from "@/features/bill/split";

export type SavedBill = Bill & { grandTotal: number; savedAt: string };
export type Friend = Person & { lastSplitAt: string; billsCount: number };

const MAX_BILLS = 200;
const MAX_FRIENDS = 40;

type HistoryState = {
  bills: SavedBill[];
  friends: Friend[];
  saveBill: (bill: Bill) => void;
  removeBill: (id: string) => void;
  removeFriend: (id: string) => void;
};

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      bills: [],
      friends: [],
      saveBill: (bill) =>
        set((s) => {
          const now = new Date().toISOString();
          const isNew = !s.bills.some((b) => b.id === bill.id);
          const saved: SavedBill = { ...bill, grandTotal: computeSplit(bill).grandTotal, savedAt: now };
          const bills = [saved, ...s.bills.filter((b) => b.id !== bill.id)].slice(0, MAX_BILLS);

          const friends = [...s.friends];
          for (const p of bill.people) {
            const i = friends.findIndex((f) => f.id === p.id);
            const prev = i >= 0 ? friends.splice(i, 1)[0] : null;
            friends.unshift({
              ...p,
              lastSplitAt: now,
              billsCount: (prev?.billsCount ?? 0) + (isNew || !prev ? 1 : 0),
            });
          }
          return { bills, friends: friends.slice(0, MAX_FRIENDS) };
        }),
      removeBill: (id) => set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),
      removeFriend: (id) => set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),
    }),
    { name: "splitto.history.v1", storage: createJSONStorage(() => localStorage), version: 1 }
  )
);

type PrefsState = { onboarded: boolean; setOnboarded: () => void };
export const usePrefs = create<PrefsState>()(
  persist((set) => ({ onboarded: false, setOnboarded: () => set({ onboarded: true }) }), {
    name: "splitto.prefs.v1",
  })
);
