import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, Download, FileText, Share2 } from "lucide-react";
import type { Bill } from "@/features/bill/types";
import { computeSplit } from "@/features/bill/split";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/AnimatedNumber";
import { formatRupiah } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/cn";
import { saveImage, savePdf, shareSummary } from "./exporters";

/** Per-person breakdown, used by the final flow step and by history. */
export function SplitSummary({ bill, celebrate }: { bill: Bill; celebrate?: boolean }) {
  const split = useMemo(() => computeSplit(bill), [bill]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<"img" | "pdf" | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const allOpen = open.size === bill.people.length;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportWith = async (kind: "img" | "pdf") => {
    if (!card.current) return;
    setBusy(kind);
    const before = open;
    setOpen(new Set(bill.people.map((p) => p.id)));
    await new Promise((r) => setTimeout(r, 320)); // let rows expand
    try {
      await (kind === "img" ? saveImage(card.current, bill) : savePdf(card.current, bill));
    } catch (e) {
      console.error(e);
      toast.error("Couldn't create the file. Try a screenshot instead.");
    } finally {
      setOpen(before);
      setBusy(null);
    }
  };

  return (
    <>
      <div ref={card} className="bg-bg pb-2">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[24px] bg-night p-5 text-star-white dark:border dark:border-border">
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
          <p className="text-[13px] text-star-silver">{bill.title || "Untitled bill"} · {formatDate(bill.date)}</p>
          <p className="mt-1 font-display text-[34px] font-semibold leading-[42px]">
            <Money value={split.grandTotal} />
          </p>
          <p className="text-[13px] text-star-silver">
            Split between {bill.people.length} {bill.people.length === 1 ? "person" : "people"}
          </p>
          <div className="mt-4 flex -space-x-2">
            {bill.people.slice(0, 7).map((p, i) => (
              <span key={p.id} className="animate-pop-in rounded-[11px] ring-2 ring-night" style={{ animationDelay: `${i * 50}ms` }}>
                <Avatar avatar={p.avatar} name={p.name} size="sm" />
              </span>
            ))}
          </div>
        </section>

        {/* People */}
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-[17px] leading-6">Who pays what</h2>
          <button
            onClick={() => setOpen(allOpen ? new Set() : new Set(bill.people.map((p) => p.id)))}
            className="text-[13px] font-semibold text-primary cursor-pointer"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
        <ul className="mt-3 space-y-2.5">
          {bill.people.map((p, i) => {
            const s = split.people.find((x) => x.personId === p.id)!;
            const isOpen = open.has(p.id);
            return (
              <li key={p.id} className="animate-rise-in overflow-hidden rounded-[16px] border border-border bg-surface" style={{ ["--i" as string]: i }}>
                <button onClick={() => toggle(p.id)} aria-expanded={isOpen} className="flex w-full items-center gap-3 p-3 text-left cursor-pointer">
                  <Avatar avatar={p.avatar} name={p.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name}</span>
                    <span className="text-[12px] text-muted">
                      {s.lines.length} item{s.lines.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="font-display text-[17px] font-semibold tabular">{formatRupiah(s.total)}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
                <div className="collapsible" data-open={isOpen}>
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

        {/* Bill totals */}
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
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          onClick={async () => {
            const r = await shareSummary(bill, split).catch(() => null);
            if (r === "copied") toast.success("Copied to clipboard");
            if (r === null) toast.error("Sharing isn't available here.");
          }}
        >
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="secondary" loading={busy === "img"} disabled={!!busy} onClick={() => exportWith("img")}>
          {busy !== "img" && <Download className="h-4 w-4" />} Image
        </Button>
        <Button variant="secondary" loading={busy === "pdf"} disabled={!!busy} onClick={() => exportWith("pdf")}>
          {busy !== "pdf" && <FileText className="h-4 w-4" />} PDF
        </Button>
      </div>
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
