import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ReceiptText, ScanLine } from "lucide-react";
import { useHistory } from "@/store/historyStore";
import { Money } from "@/components/ui/AnimatedNumber";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/cn";

const MONTHS = 6;

export default function Activity() {
  const bills = useHistory((s) => s.bills);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - k), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const inMonth = bills.filter((b) => b.date.startsWith(key));
      return { key, label: d.toLocaleDateString("en-GB", { month: "short" }), total: inMonth.reduce((s, b) => s + b.grandTotal, 0), count: inMonth.length };
    });
  }, [bills]);

  const [selected, setSelected] = useState(MONTHS - 1);
  const max = Math.max(...months.map((m) => m.total), 1);
  const m = months[selected];

  return (
    <>
      <header className="safe-top pt-4 pb-4">
        <h1 className="text-[28px] leading-9">Your splits</h1>
      </header>

      <section className="rounded-[24px] border border-border bg-surface p-5">
        <p className="text-[13px] text-muted">Split in {new Date(`${m.key}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
        <p className="mt-1 font-display text-[30px] font-semibold leading-9">
          <Money value={m.total} />
        </p>
        <p className="text-[13px] text-muted">
          {m.count} bill{m.count === 1 ? "" : "s"}
        </p>

        {/* Bar chart: tap a month to inspect it */}
        <div className="mt-6 flex h-44 items-end gap-3" role="group" aria-label="Spending by month">
          {months.map((mo, i) => {
            const h = mo.total === 0 ? 0 : Math.max(10, (mo.total / max) * 100);
            const on = i === selected;
            return (
              <button
                key={mo.key}
                onClick={() => setSelected(i)}
                aria-pressed={on}
                aria-label={`${mo.label}: ${formatRupiah(mo.total)}`}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2 cursor-pointer"
              >
                {on && mo.total > 0 && (
                  <span className="animate-pop-in absolute z-10 whitespace-nowrap rounded-md bg-night px-2 py-1 text-[11px] font-semibold text-star-white" style={{ bottom: `calc(${h}% + 28px)` }}>
                    {formatRupiah(mo.total)}
                  </span>
                )}
                <span
                  className={cn("w-full rounded-[10px] transition-all duration-500 ease-out", on ? "bg-primary" : "bg-chart-bar group-hover:bg-primary/40")}
                  style={{ height: `max(6px, calc(${h}% - 22px))`, transitionDelay: `${i * 40}ms` }}
                />
                <span className={cn("text-[12px]", on ? "font-semibold text-text" : "text-muted")}>{mo.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-[17px] leading-6">All bills</h2>
        {bills.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border p-6 text-center">
            <p className="font-semibold">Nothing here yet</p>
            <p className="mt-1 text-[13px] text-muted">Finished splits are saved on this phone.</p>
            <Link to="/scan">
              <Button className="mt-4">
                <ScanLine className="h-4 w-4" /> Scan a receipt
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {bills.map((b, i) => (
              <li key={b.id} className="animate-rise-in" style={{ ["--i" as string]: Math.min(i, 10) }}>
                <Link to={`/history/${b.id}`} className="pressable flex items-center gap-3 rounded-[16px] border border-border bg-surface p-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary-subtle">
                    <ReceiptText className="h-5 w-5 text-primary-subtle-text" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{b.title || "Untitled bill"}</span>
                    <span className="text-[12px] text-muted">
                      {formatDate(b.date)} · {b.people.length} people
                    </span>
                  </span>
                  <span className="font-semibold tabular">{formatRupiah(b.grandTotal)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
