import { useEffect, useRef, useState } from "react";
import { formatRupiah } from "@/lib/money";

/** Tweens to the new value so totals "count" instead of jumping. */
export function useTweenedNumber(value: number, ms = 420) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || from.current === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(a + (value - a) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, ms]);
  return shown;
}

export function Money({ value, className }: { value: number; className?: string }) {
  const shown = useTweenedNumber(value);
  return <span className={`tabular ${className ?? ""}`}>{formatRupiah(shown)}</span>;
}
