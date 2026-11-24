const IDR = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** 125000 → "Rp 125.000" */
export function formatRupiah(value: number) {
  const sign = value < 0 ? "−" : "";
  return `${sign}Rp ${IDR.format(Math.abs(Math.round(value)))}`;
}

/** 125000 → "125.000" (for inputs) */
export function formatNumber(value: number) {
  return IDR.format(Math.round(value));
}

/** Free-typed "12.500" / "12,500" / "Rp 12500" → 12500. Empty → 0. */
export function parseRupiahInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}
