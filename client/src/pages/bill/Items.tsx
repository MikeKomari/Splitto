import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { FlowHeader, StickyCta } from "@/components/layout/FlowHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { MoneyField, PercentField, QtyStepper, Segmented } from "@/components/ui/Fields";
import { Money } from "@/components/ui/AnimatedNumber";
import { useDraft } from "@/store/draftStore";
import { chargeTotals, lineTotal } from "@/features/bill/split";
import { formatRupiah } from "@/lib/money";
import { useDraftGuard } from "./useDraftGuard";
import type { BillItem } from "@/features/bill/types";

export default function Items() {
  const draft = useDraftGuard();
  const navigate = useNavigate();
  const location = useLocation();
  const { patch, setCharges, addItem, updateItem, removeItem, restoreItem } = useDraft();
  const focusId = useRef<string | null>((location.state as { focusItem?: string } | null)?.focusItem ?? null);

  const totals = useMemo(() => (draft ? chargeTotals(draft.items, draft.charges) : null), [draft]);
  if (!draft || !totals) return null;
  const { charges } = draft;

  const onAdd = () => {
    focusId.current = addItem();
  };
  const onRemove = (item: BillItem, index: number) => {
    removeItem(item.id);
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          Removed {item.name || "item"}
          <button
            className="font-semibold text-primary cursor-pointer"
            onClick={() => {
              restoreItem(item, index);
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </span>
      ),
      { id: "remove-item" }
    );
  };

  const valid = draft.items.filter((i) => i.name.trim() && i.unitPrice > 0);
  const next = () => {
    if (valid.length === 0) return void toast.error("Add at least one item with a name and price.");
    // Drop blank rows instead of carrying them into the split.
    draft.items.filter((i) => !valid.includes(i)).forEach((i) => removeItem(i.id));
    navigate("/bill/people");
  };

  const diff = draft.receiptTotal !== undefined ? totals.grandTotal - draft.receiptTotal : null;

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-40">
      <FlowHeader step={0} title="Review items" back="/app" />

      <div className="animate-page-in">
        <input
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Where did you eat?"
          aria-label="Bill name"
          className="w-full bg-transparent font-display text-[24px] font-semibold leading-8 placeholder:text-muted/60 focus:outline-none"
        />
        <input
          type="date"
          value={draft.date}
          onChange={(e) => e.target.value && patch({ date: e.target.value })}
          aria-label="Bill date"
          className="mt-1 bg-transparent text-[14px] text-muted focus:outline-none"
        />

        <ul className="mt-5 space-y-3">
          {draft.items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              index={i}
              autoFocus={focusId.current === item.id}
              onFocused={() => (focusId.current = null)}
              onChange={(p) => updateItem(item.id, p)}
              onRemove={() => onRemove(item, i)}
            />
          ))}
        </ul>

        <button
          onClick={onAdd}
          className="pressable mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-border text-[15px] font-semibold text-primary hover:border-primary/60 hover:bg-primary-subtle/40 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Add item
        </button>

        {/* Charges */}
        <section className="mt-6 rounded-[20px] border border-border bg-surface p-4" aria-label="Charges">
          <Row label="Items" value={<Money value={totals.itemsTotal} />} />
          <Row
            label="Discount"
            control={
              <div className="flex items-center gap-2">
                <Segmented
                  label="Discount type"
                  value={charges.discount.type}
                  options={[
                    { value: "amount", label: "Rp" },
                    { value: "percent", label: "%" },
                  ]}
                  onChange={(type) => setCharges({ discount: { type, value: 0 } })}
                />
                {charges.discount.type === "percent" ? (
                  <PercentField label="Discount percent" value={charges.discount.value} onValue={(value) => setCharges({ discount: { type: "percent", value } })} />
                ) : (
                  <MoneyField aria-label="Discount amount" className="w-[116px]" value={charges.discount.value} onValue={(value) => setCharges({ discount: { type: "amount", value } })} />
                )}
              </div>
            }
            value={<span className="text-success">−{formatRupiah(totals.discount)}</span>}
          />
          <Row
            label="Service"
            control={<PercentField label="Service percent" value={charges.servicePercent} onValue={(v) => setCharges({ servicePercent: v })} />}
            value={<Money value={totals.service} />}
          />
          <Row
            label="Tax (PB1)"
            control={<PercentField label="Tax percent" value={charges.taxPercent} onValue={(v) => setCharges({ taxPercent: v })} />}
            value={<Money value={totals.tax} />}
          />
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold">Total bill</span>
            <Money value={totals.grandTotal} className="font-display text-[20px] font-semibold" />
          </div>
          {diff !== null && (
            <p
              key={diff === 0 ? "ok" : "diff"}
              className={`animate-pop-in mt-3 flex items-center gap-1.5 rounded-sm px-3 py-2 text-[12px] font-semibold ${diff === 0 ? "bg-[var(--tile-3)] text-success" : "bg-gold-100 text-warning"}`}
            >
              {diff === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {diff === 0
                ? "Matches the receipt total"
                : `${formatRupiah(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than the receipt (${formatRupiah(draft.receiptTotal!)})`}
            </p>
          )}
        </section>
      </div>

      <StickyCta>
        <Button size="lg" block onClick={next} disabled={draft.items.length === 0}>
          Next: who's sharing
        </Button>
      </StickyCta>
    </div>
  );
}

function Row({ label, control, value }: { label: string; control?: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-2 py-1">
      <span className="w-[72px] shrink-0 text-[14px] text-muted">{label}</span>
      <div className="flex-1">{control}</div>
      <span className="text-right text-[14px] font-semibold tabular">{value}</span>
    </div>
  );
}

function ItemRow({
  item,
  index,
  autoFocus,
  onFocused,
  onChange,
  onRemove,
}: {
  item: BillItem;
  index: number;
  autoFocus: boolean;
  onFocused: () => void;
  onChange: (p: Partial<BillItem>) => void;
  onRemove: () => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      onFocused();
    }
  }, [autoFocus, onFocused]);

  return (
    <li className="animate-rise-in rounded-[16px] border border-border bg-surface p-3" style={{ ["--i" as string]: Math.min(index, 8) }}>
      <div className="flex items-center gap-2">
        <input
          ref={nameRef}
          value={item.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Item name"
          aria-label="Item name"
          className="h-10 min-w-0 flex-1 rounded-sm bg-transparent px-1 text-[15px] font-semibold placeholder:font-normal placeholder:text-muted/60 focus:bg-surface-raised focus:outline-none"
        />
        <IconButton label={`Remove ${item.name || "item"}`} onClick={onRemove} className="h-9 w-9 text-muted hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <QtyStepper value={item.quantity} onChange={(quantity) => onChange({ quantity })} />
        <span className="text-[13px] text-muted">×</span>
        <MoneyField aria-label="Price per item" className="flex-1" value={item.unitPrice} onValue={(unitPrice) => onChange({ unitPrice })} />
      </div>
      {item.quantity > 1 && <p className="mt-1.5 text-right text-[12px] text-muted tabular">Line total {formatRupiah(lineTotal(item))}</p>}
    </li>
  );
}
