import { ChevronDown } from "lucide-react";
import type { Bill } from "@/features/bill/types";
import type { SplitResult } from "@/features/bill/split";
import { Avatar } from "@/components/ui/Avatar";
import { Money } from "@/components/ui/AnimatedNumber";
import { formatRupiah } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/cn";

type Props = {
  bill: Bill;
  split: SplitResult;
  /** Which people are expanded. "all" for the export card. */
  open: Set<string> | "all";
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  celebrate?: boolean;
};

/** Hero + per-person breakdown + bill totals. Shared by the screen and the image. */
export function SummaryBody({ bill, split, open, onToggle, onToggleAll, celebrate }: Props) {
  const isOpen = (id: string) => open === "all" || open.has(id);
  const allOpen = open === "all" || open.size === bill.people.length;
  const interactive = !!onToggle;

  return (
    <>
      <section className="relative overflow-hidden rounded-[24px] bg-night p-5 text-star-white">
        <svg className="absolute -right-6 -top-8 h-40 w-40 opacity-50" viewBox="0 0 100 100" aria-hidden>
          <ellipse cx="50" cy="50" rx="46" ry="30" fill="none" stroke="#A283E6" strokeWidth=".8" strokeDasharray="1.5 4" />
        </svg>
        <svg className="animate-twinkle absolute right-6 top-5 h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z" fill="#FFC857" />
        </svg>
        {celebrate && (
          <svg className="mb-2 h-8 w-8" viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r="15" fill="#3EB489" fillOpacity=".18" />
            <path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#3EB489" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
          </svg>
        )}
        <p className="text-[13px] text-star-silver">
          {bill.title || "Untitled bill"} · {formatDate(bill.date)}
        </p>
        <p className="mt-1 font-display text-[34px] font-semibold leading-[42px]">
          <Money value={split.grandTotal} />
        </p>
        <p className="text-[13px] text-star-silver">
          Split between {bill.people.length} {bill.people.length === 1 ? "person" : "people"}
        </p>
        <div className="mt-4 flex -space-x-2">
          {bill.people.slice(0, 8).map((p, i) => (
            <span key={p.id} className="animate-pop-in rounded-[11px] ring-2 ring-night" style={{ animationDelay: `${i * 50}ms` }}>
              <Avatar avatar={p.avatar} name={p.name} size="sm" />
            </span>
          ))}
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-[17px] leading-6">Who pays what</h2>
        {onToggleAll && (
          <button onClick={onToggleAll} className="text-[13px] font-semibold text-primary cursor-pointer">
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>
      <ul className="mt-3 space-y-2.5">
        {bill.people.map((p, i) => {
          const s = split.people.find((x) => x.personId === p.id)!;
          const expanded = isOpen(p.id);
          const head = (
            <>
              <Avatar avatar={p.avatar} name={p.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="text-[12px] text-muted">
                  {s.lines.length} item{s.lines.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="font-display text-[17px] font-semibold tabular">{formatRupiah(s.total)}</span>
            </>
          );
          return (
            <li key={p.id} className="animate-rise-in overflow-hidden rounded-[16px] border border-border bg-surface" style={{ ["--i" as string]: i }}>
              {interactive ? (
                <button onClick={() => onToggle!(p.id)} aria-expanded={expanded} className="flex w-full items-center gap-3 p-3 text-left cursor-pointer">
                  {head}
                  <ChevronDown className={cn("h-4 w-4 text-muted transition-transform duration-300", expanded && "rotate-180")} />
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3">{head}</div>
              )}
              <div className="collapsible" data-open={expanded}>
                <div>
                  <div className="space-y-1 border-t border-border px-3 pb-3 pt-2 text-[13px]">
                    {s.lines.map((l) => (
                      <div key={l.itemId} className="flex justify-between gap-3 text-muted">
                        <span className="truncate">
                          {l.quantity > 1 && `${l.quantity}× `}
                          {l.name}
                          {l.sharedWith > 1 && <span className="text-primary"> · shared ÷{l.sharedWith}</span>}
                        </span>
                        <span className="tabular">{formatRupiah(l.amount)}</span>
                      </div>
                    ))}
                    <div className="mt-2 space-y-1 border-t border-dashed border-border pt-2">
                      {s.discount > 0 && <Line label="Discount" value={-s.discount} />}
                      {s.service > 0 && <Line label="Service" value={s.service} />}
                      {s.tax > 0 && <Line label="Tax" value={s.tax} />}
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="tabular">{formatRupiah(s.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="mt-4 space-y-1.5 rounded-[16px] border border-border bg-surface p-4 text-[14px]">
        <Line label="Items" value={split.itemsTotal} />
        {split.discount > 0 && <Line label="Discount" value={-split.discount} />}
        {split.service > 0 && <Line label={`Service ${bill.charges.servicePercent}%`} value={split.service} />}
        {split.tax > 0 && <Line label={`Tax ${bill.charges.taxPercent}%`} value={split.tax} />}
        <div className="flex justify-between border-t border-border pt-2 font-semibold">
          <span>Total bill</span>
          <span className="tabular">{formatRupiah(split.grandTotal)}</span>
        </div>
      </section>
    </>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className={cn("tabular", value < 0 && "text-success")}>{formatRupiah(value)}</span>
    </div>
  );
}
