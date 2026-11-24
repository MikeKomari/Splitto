import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Users, X } from "lucide-react";
import { FlowHeader, StickyCta } from "@/components/layout/FlowHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Money } from "@/components/ui/AnimatedNumber";
import { useDraft } from "@/store/draftStore";
import { computeSplit, lineTotal } from "@/features/bill/split";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useDraftGuard } from "./useDraftGuard";
import { AddPersonSheet } from "./AddPersonSheet";

/**
 * Assignment works like a paint brush: pick a person, then tap every item
 * they had. Shared items just get tapped by several people. This is far
 * fewer taps than opening a picker per item.
 */
export default function People() {
  const draft = useDraftGuard();
  const navigate = useNavigate();
  const { addPerson, removePerson, toggleAssignee, assignEveryone, splitAllEqually } = useDraft();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState(false);

  const split = useMemo(() => (draft ? computeSplit(draft) : null), [draft]);
  if (!draft || !split) return null;
  const active = draft.people.find((p) => p.id === activeId) ?? draft.people[0] ?? null;
  const shareOf = (id: string) => split.people.find((s) => s.personId === id)!;

  const onItemTap = (itemId: string) => {
    if (!active) {
      setSheet(true);
      return;
    }
    toggleAssignee(itemId, active.id);
    navigator.vibrate?.(6);
  };

  const next = () => {
    if (draft.people.length === 0) return void toast.error("Add the people sharing this bill.");
    if (split.unassignedCount > 0) return void toast.error(`${split.unassignedCount} item${split.unassignedCount > 1 ? "s are" : " is"} not assigned yet.`);
    navigate("/bill/summary");
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-44">
      <FlowHeader
        step={1}
        title="Who had what"
        back="/bill/items"
        right={
          draft.people.length > 0 && (
            <button onClick={() => setEditing((e) => !e)} className="px-2 text-[13px] font-semibold text-primary cursor-pointer">
              {editing ? "Done" : "Edit"}
            </button>
          )
        }
      />

      {/* People strip */}
      <section aria-label="People" className="animate-page-in">
        <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 pt-1">
          {draft.people.map((p, i) => {
            const isActive = active?.id === p.id && !editing;
            return (
              <li key={p.id} className="animate-rise-in relative" style={{ ["--i" as string]: i }}>
                <button
                  onClick={() => (editing ? removePerson(p.id) : setActiveId(p.id))}
                  aria-pressed={isActive}
                  aria-label={editing ? `Remove ${p.name}` : `Assign items to ${p.name}`}
                  className={cn("pressable flex w-[72px] flex-col items-center gap-1 rounded-[18px] p-1.5 cursor-pointer", isActive && "bg-primary-subtle", editing && "animate-shake")}
                >
                  <Avatar avatar={p.avatar} name={p.name} size="md" ring={isActive} />
                  <span className={cn("w-full truncate text-center text-[12px]", isActive ? "font-semibold text-primary-subtle-text" : "text-text")}>{p.name}</span>
                  <span className="text-[11px] text-muted tabular">{formatRupiah(shareOf(p.id).total)}</span>
                </button>
                {editing && (
                  <span className="animate-pop-in pointer-events-none absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </li>
            );
          })}
          <li>
            <button onClick={() => setSheet(true)} className="pressable flex w-[72px] flex-col items-center gap-1 p-1.5 cursor-pointer" aria-label="Add person">
              <span className="flex h-14 w-14 items-center justify-center rounded-[16px] border-2 border-dashed border-border-strong/50 text-muted transition-colors hover:border-primary hover:text-primary">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-[12px] text-muted">Add</span>
            </button>
          </li>
        </ul>
        {active && !editing && (
          <p key={active.id} className="animate-fade-in mt-2 text-[13px] text-muted">
            Tap everything <span className="font-semibold text-text">{active.name}</span> had. Tap again to undo.
          </p>
        )}
      </section>

      {/* Items */}
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-[17px] leading-6">Items</h2>
        {draft.people.length > 1 && (
          <button onClick={splitAllEqually} className="flex items-center gap-1 text-[13px] font-semibold text-primary cursor-pointer">
            <Users className="h-4 w-4" /> Split all equally
          </button>
        )}
      </div>
      <ul className="mt-3 space-y-2.5">
        {draft.items.map((item, i) => {
          const mine = active ? item.assignees.includes(active.id) : false;
          const who = draft.people.filter((p) => item.assignees.includes(p.id));
          return (
            <li key={item.id} className="animate-rise-in" style={{ ["--i" as string]: Math.min(i, 8) }}>
              <div
                className={cn(
                  "relative rounded-[16px] border bg-surface p-3 transition-transform duration-150 has-[>button:first-child:active]:scale-[0.98]",
                  mine ? "border-primary bg-primary-subtle/60" : who.length === 0 ? "border-dashed border-warning/60" : "border-border"
                )}
              >
                {/* Whole-card tap target; content sits above it but lets taps through. */}
                <button
                  onClick={() => onItemTap(item.id)}
                  aria-pressed={mine}
                  aria-label={active ? `${item.name}: ${mine ? "remove" : "add"} ${active.name}` : `${item.name}: add a person first`}
                  className="absolute inset-0 rounded-[16px] cursor-pointer"
                />
                <div className="pointer-events-none relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="text-[12px] text-muted">
                      {item.quantity} × {formatRupiah(item.unitPrice)}
                      {who.length > 1 && ` · ${formatRupiah(Math.round(lineTotal(item) / who.length))} each`}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular">{formatRupiah(lineTotal(item))}</span>
                </div>
                <div className="pointer-events-none relative mt-2 flex min-h-8 items-center justify-between">
                  <div className="flex -space-x-2">
                    {who.length === 0 ? (
                      <span className="text-[12px] font-semibold text-warning">Not assigned</span>
                    ) : (
                      who.map((p) => (
                        <span key={p.id} className="animate-pop-in rounded-[9px] ring-2 ring-surface">
                          <Avatar avatar={p.avatar} name={p.name} size="xs" />
                        </span>
                      ))
                    )}
                  </div>
                  {draft.people.length > 1 && (
                    <button
                      onClick={() => assignEveryone(item.id)}
                      aria-label={`${who.length === draft.people.length ? "Clear" : "Everyone shares"} ${item.name}`}
                      className="pointer-events-auto rounded-full px-2.5 py-1 text-[12px] font-semibold text-primary hover:bg-primary-subtle cursor-pointer"
                    >
                      {who.length === draft.people.length ? "Clear" : "Everyone"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <StickyCta>
        <div className="mb-3 flex items-center justify-between text-[13px]">
          {split.unassignedCount > 0 ? (
            <span className="font-semibold text-warning">
              {split.unassignedCount} left · {formatRupiah(split.unassigned)}
            </span>
          ) : (
            <span className="font-semibold text-success">All items assigned</span>
          )}
          <span className="text-muted">
            Total <Money value={split.grandTotal} className="font-semibold text-text" />
          </span>
        </div>
        <Button size="lg" block onClick={next}>
          See the split
        </Button>
      </StickyCta>

      <AddPersonSheet
        open={sheet}
        onClose={() => setSheet(false)}
        inBill={draft.people}
        onAdd={(p) => {
          const person = addPerson(p);
          setActiveId(person.id);
        }}
      />
    </div>
  );
}
