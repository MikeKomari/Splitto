import { useEffect, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { formatNumber, parseRupiahInput } from "@/lib/money";

const base =
  "h-11 w-full rounded-sm border border-border bg-surface px-3 text-[15px] text-text placeholder:text-muted/70 transition-colors focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-primary/25";

export function TextField({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...rest} />;
}

/** Rupiah input with live thousands separators; emits integers. */
export function MoneyField({
  value,
  onValue,
  className,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & { value: number; onValue: (v: number) => void }) {
  const [text, setText] = useState(value ? formatNumber(value) : "");
  useEffect(() => {
    if (parseRupiahInput(text) !== value) setText(value ? formatNumber(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">Rp</span>
      <input
        inputMode="numeric"
        autoComplete="off"
        className={cn(base, "pl-9 text-right tabular")}
        value={text}
        onChange={(e) => {
          const v = parseRupiahInput(e.target.value);
          setText(v ? formatNumber(v) : "");
          onValue(v);
        }}
        {...rest}
      />
    </div>
  );
}

/** Small numeric percent input. */
export function PercentField({ value, onValue, label }: { value: number; onValue: (v: number) => void; label: string }) {
  const [text, setText] = useState(String(value || ""));
  useEffect(() => {
    if (Number(text.replace(",", ".")) !== value) setText(value ? String(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="relative w-[84px]">
      <input
        aria-label={label}
        inputMode="decimal"
        className={cn(base, "h-10 pr-7 text-right tabular")}
        value={text}
        placeholder="0"
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d.,]/g, "").slice(0, 5);
          setText(cleaned);
          const n = Number(cleaned.replace(",", "."));
          onValue(Number.isFinite(n) ? Math.min(n, 100) : 0);
        }}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">%</span>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  label: string;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div role="radiogroup" aria-label={label} className="relative inline-grid h-10 grid-flow-col auto-cols-fr rounded-sm bg-surface-raised p-1">
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-[5px] bg-surface shadow-sm transition-transform duration-200 ease-out"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative z-10 min-w-10 px-3 text-[13px] font-semibold transition-colors cursor-pointer",
            o.value === value ? "text-text" : "text-muted"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function QtyStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const btn =
    "pressable h-8 w-8 rounded-[8px] text-[18px] leading-none text-text hover:bg-surface-raised disabled:opacity-30 cursor-pointer";
  return (
    <div className="inline-flex items-center rounded-sm border border-border bg-surface" role="group" aria-label="Quantity">
      <button className={btn} onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Decrease quantity">
        −
      </button>
      <span key={value} className="animate-pop-in w-7 text-center text-[14px] font-semibold tabular" aria-live="polite">
        {value}
      </span>
      <button className={btn} onClick={() => onChange(Math.min(99, value + 1))} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
