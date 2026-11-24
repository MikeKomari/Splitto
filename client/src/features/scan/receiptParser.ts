/**
 * Turns raw OCR text from an Indonesian-style receipt into structured data.
 *
 * Deterministic, offline, free. It is heuristic: OCR text is noisy, so the
 * result always goes to the editor for the user to confirm. We also return a
 * reconciliation check (do the items add up to the printed subtotal/total?)
 * so the UI can say how much to trust it.
 *
 * Layouts handled (all seen in the sample receipts in model/SampleData.zip):
 *  A. "2x @63.000   126.000" with the item name on the line before OR after
 *  B. "1 Katsu & Chick Batubara   35,000"          (qty, name, line total)
 *  C. "MILO ACT-GO 180ML   3 21600 64.800"         (name, qty, unit, total)
 *  D. "Great Braised Chicken   1   45,900"         (name, qty, line total)
 */

export type ParsedItem = { name: string; quantity: number; unitPrice: number };

export type ParsedReceipt = {
  items: ParsedItem[];
  subtotal?: number;
  total?: number;
  tax?: number;
  service?: number;
  discount?: number;
  /** Rates printed on the receipt, e.g. "Service (5,00%)", "PB1 (10%)". */
  servicePercent?: number;
  taxPercent?: number;
  /** "Prices are inclusive of tax": tax is not added on top. */
  taxInclusive: boolean;
  check: {
    itemsSum: number;
    against?: "subtotal" | "total";
    expected?: number;
    matches: boolean;
  };
};

// ---------------------------------------------------------------------------
// Amounts

const RP = String.raw`(?:R[pPeErR][.:]?\s*)`;
/** 35,000 | 116, 000 | 1.250.000 | 25.000,00 | Rp28500 | (9.000) | -14950 */
const AMOUNT_SRC = String.raw`(?<![A-Za-z0-9])\(?-?${RP}?(?:\d{1,3}(?:[.,] ?\d{3})+(?:,\d{2})?|\d{3,})\)?`;
const AMOUNT_AT_END = new RegExp(String.raw`(${AMOUNT_SRC})\W{0,2}$`);
const AMOUNT_ALL = () => new RegExp(AMOUNT_SRC, "g");
const MAX_AMOUNT = 100_000_000;
/** Nothing on an Indonesian menu costs less than Rp 500. */
const MIN_ITEM = 500;

export function parseAmount(raw: string): number | null {
  let s = raw.trim();
  const negative = /^\(|^-|\)$/.test(s);
  s = s.replace(/[()\-\s]/g, "");
  const hadPrefix = new RegExp(`^${RP}`).test(s);
  s = s.replace(new RegExp(`^${RP}`), "").replace(/,\d{2}$/, "");
  if (!/^\d+([.,]\d{3})*$/.test(s)) return null;
  const plain = /^\d+$/.test(s);
  // Phone numbers, ids and zero-padded codes are not money.
  if (plain && !hadPrefix && /^0/.test(s)) return null;
  const value = Number(s.replace(/[.,]/g, ""));
  if (!Number.isFinite(value) || value > MAX_AMOUNT) return null;
  return negative ? -value : value;
}

// ---------------------------------------------------------------------------
// Line classification

type SummaryKey = "subtotal" | "total" | "tax" | "service" | "discount";
const SUMMARY: Array<[SummaryKey, RegExp]> = [
  ["subtotal", /\bs[uwy][bpg]\s*-?\s*tota|\bsub\s*total/i],
  ["service", /\bservice|\bsvc\b|\bserv\b|biaya\s+layanan/i],
  ["tax", /\bp[abd8r]\s?[1il]\b|\bpbi\b|\bpajak|\btax\b|\bppn\b/i],
  ["discount", /\bdisc|diskon|potongan|voucher|promo/i],
  ["total", /grand\s*tota|\btota?l\b|tagihan|jumlah\s+bayar/i],
];
const CATEGORY_TOTAL = /total\s+(food|beverage|item|qty|paid|bayar)/i;
const SUMMARY_START = /\bs[uwy][bpg]\s*-?\s*tota|\btota?l\b|grand/i;

/** Lines that are never items: headers, payment, footers. */
const NOISE =
  /\b(np[wh]p|kritik|saran|sms|wa:|cash|tunai|kembali|change|qris|debit|kredit|credit|card|paid|bayar|pembayaran|kasir|cashier|waktu|date|tanggal|tgl|order|meja|table|pax|telp?|npwp|alamat|member|purchase|terima\s*kasih|thank|hemat|dpp|kupon|cashback|items?\b|product|produk|harga\s+jual)/i;
/** The header (store, address, cashier, date) ends at the last of these. */
const HEADER_END = /\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\b\d{1,2}:\d{2}\b|\b(kasir|cashier|order|meja|waktu|tipe pesanan|name\s+item)\b/i;

/** Drop OCR crumbs ("y", "|", "ha”", "many") hanging off the end of a line. */
function stripTail(text: string) {
  let t = text;
  for (let i = 0; i < 4; i++) {
    // Crumbs: short non-digit runs, or any single character ("4", "|").
    const next = t.replace(/\s+(?:[^\d\s]{1,4}|\S)$/, "");
    if (next === t) break;
    t = next;
  }
  // Only useful if it uncovers a price; otherwise keep real words like "HOT TEA".
  return /\d{3}\W{0,2}$/.test(t) ? t : text;
}

type Line = { text: string; core: string; amount: number | null };

/** Name lines keep real short words ("Udon", "Ocha"); only 1–2 char crumbs go. */
function nameText(line: Line) {
  return line.text.replace(/(\s+(?:[^\sA-Za-z0-9]{1,2}|[A-Za-z]))+$/, "");
}

function letters(s: string) {
  return (s.match(/[A-Za-z]/g) ?? []).length;
}

const SERVICE_RATES = [0, 5, 6, 7, 8, 10, 12, 15];
const TAX_RATES = [0, 10, 11, 12];

/**
 * Service or tax line unreadable, but subtotal and total are fine: find the
 * one common rate pair that reproduces the printed total exactly (same
 * rounding as split.ts). If zero or several pairs fit, leave it to the user.
 */
function inferRates(
  summary: Partial<Record<SummaryKey, number>>,
  percents: Partial<Record<"service" | "tax", number>>
) {
  if (summary.subtotal === undefined || summary.total === undefined) return;
  if (percents.service !== undefined && percents.tax !== undefined) return;
  const base = summary.subtotal - (summary.discount ?? 0);
  if (base <= 0 || summary.total <= base) return;
  const fits: Array<[number, number, number, number]> = [];
  for (const sp of percents.service !== undefined ? [percents.service] : SERVICE_RATES)
    for (const tp of percents.tax !== undefined ? [percents.tax] : TAX_RATES) {
      const svc = Math.round((base * sp) / 100);
      const tax = Math.round(((base + svc) * tp) / 100);
      if (Math.abs(base + svc + tax - summary.total) <= 1) fits.push([sp, tp, svc, tax]);
    }
  if (fits.length !== 1) return;
  const [sp, tp, svc, tax] = fits[0];
  percents.service = sp;
  percents.tax = tp;
  summary.service = svc;
  summary.tax = tax;
}

/** A line that is just prices: "@18.000   18.000" (OCR crumbs allowed). */
function isPriceOnly(line: Line) {
  if (line.amount === null || line.amount <= 0) return false;
  const withoutAmounts = line.core.replace(AMOUNT_ALL(), " ").replace(/@/g, " ");
  return letters(withoutAmounts) <= 2 && !qtyLine(line.core);
}

function isSummary(text: string) {
  return SUMMARY.some(([, re]) => re.test(text));
}

function isNameLike(line: Line) {
  const t = line.core;
  if (letters(t) < 3 || NOISE.test(t) || isSummary(t)) return false;
  if (line.amount !== null) return false;
  if (qtyLine(t)) return false;
  return (t.match(/\d/g) ?? []).length <= letters(t);
}

export function cleanName(raw: string) {
  return raw
    .replace(/@\s*\S*/g, " ")
    .replace(/\/\s*d[il]ne?\s*[il]n.*$/i, "")
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9)%.]+$/g, "")
    // Left-edge crumbs from the photo background: "J ", "AF N ", "Rw) ", "KE "
    .replace(/^(?:(?:[A-Za-z]|[A-Z]{2}|\S*[^\sA-Za-z0-9&(]\S*)\s+)+(?=[A-Za-z(])/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** OCR reads 1 as I/i/l and 7 as T. */
function ocrInt(s: string) {
  return Number(s.replace(/[Tt]/g, "7").replace(/[Iil|]/g, "1"));
}

/** "2x @63.000 126.000" → qty + unit? + total. */
function qtyLine(text: string) {
  const m = text.match(/(?:^|[^\w@])([0-9TIil]{1,2})\s?[xX×%]\s/);
  if (!m || m.index! > Math.max(12, text.length * 0.4)) return null;
  const rest = text.slice(m.index! + m[0].length);
  const amounts = [...rest.matchAll(AMOUNT_ALL())]
    .map((a) => parseAmount(a[0]))
    .filter((v): v is number => v !== null && v > 0);
  if (amounts.length === 0) return null;
  const qty = ocrInt(m[1]);
  if (amounts.length === 1) return { qty, unit: null, total: amounts[0] };
  return { qty, unit: amounts[amounts.length - 2], total: amounts[amounts.length - 1] };
}

/** Reconcile qty / unit / total; OCR often garbles one of the three. */
function resolveQty(qtyRaw: number | null, unit: number | null, total: number) {
  if (unit && unit > 0) {
    const q = total / unit;
    if (Number.isInteger(q) && q >= 1 && q <= 99) return { quantity: q, unitPrice: unit };
    // "@18.000" read as "418.000": drop the leading digit and try again.
    const digits = String(unit).length;
    if (digits >= 5) {
      const u = unit % 10 ** (digits - 1);
      const q2 = u > 0 ? total / u : 0;
      if (Number.isInteger(q2) && q2 >= 1 && q2 <= 99) return { quantity: q2, unitPrice: u };
    }
  }
  const quantity = qtyRaw && qtyRaw >= 1 && qtyRaw <= 99 ? qtyRaw : 1;
  const unitPrice = total / quantity;
  return Number.isInteger(unitPrice) ? { quantity, unitPrice } : { quantity: 1, unitPrice: total };
}

// ---------------------------------------------------------------------------

export function parseReceipt(text: string): ParsedReceipt {
  const lines: Line[] = text
    .split(/\r?\n/)
    .map((t) => t.replace(/[|¦“”"‘’]/g, " ").replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 0)
    .map((t) => {
      const core = stripTail(t);
      const m = core.match(AMOUNT_AT_END);
      return { text: t, core, amount: m ? parseAmount(m[1]) : null };
    });

  let taxInclusive = /inclusive|termasuk\s+pajak|incl\.?\s+tax|sudah\s+termasuk/i.test(text);

  let summaryStart = lines.findIndex(
    (l) => l.amount !== null && SUMMARY_START.test(l.core) && !CATEGORY_TOTAL.test(l.core)
  );
  if (summaryStart < 0) summaryStart = lines.length;

  // The header (store, address, cashier, date) ends at the last header-ish
  // line before the first line that clearly is an item.
  const strongItem = (l: Line) =>
    qtyLine(l.core) !== null ||
    (l.amount !== null && l.amount > 0 && letters(l.core) >= 3 && !NOISE.test(l.core) &&
      !isSummary(l.core) && !HEADER_END.test(l.core) && /[.,]\s?\d{3}\W*$|R[pPeErR]/.test(l.core));
  let firstItem = lines.findIndex((l, i) => i < summaryStart && strongItem(l));
  if (firstItem < 0) firstItem = summaryStart;
  let itemsStart = 0;
  for (let i = 0; i < firstItem; i++) {
    if (HEADER_END.test(lines[i].core) && !isSummary(lines[i].core)) itemsStart = i + 1;
  }

  // --- Summary values -----------------------------------------------------
  const summary: Partial<Record<SummaryKey, number>> = {};
  const percents: Partial<Record<"service" | "tax", number>> = {};
  let paid: number | undefined;
  let negatives = 0;
  for (let i = itemsStart; i < lines.length; i++) {
    const { core: t, amount } = lines[i];
    // Rates are read even when the amount on the line is unreadable.
    if (i >= summaryStart && !/inclusive|termasuk|dpp/i.test(t)) {
      for (const key of ["service", "tax"] as const) {
        if (!SUMMARY.find(([k]) => k === key)![1].test(t)) continue;
        // "(5,00%)", "10%", and OCR's "(5,008)" where % became 8.
        const pm = t.match(/\(\s*(\d{1,2})(?=\s*(?:[.,%8)]|$))|\b(\d{1,2})(?:[.,]\d{1,2})?\s*%/);
        const pct = pm ? Number(pm[1] ?? pm[2]) : NaN;
        if (pct > 0 && pct <= 25) percents[key] ??= pct;
        break;
      }
    }
    if (amount === null) continue;
    if (/inclusive|termasuk|dpp/i.test(t)) {
      taxInclusive = true;
      continue;
    }
    if (amount < 0) {
      negatives += -amount;
      continue;
    }
    if (i < summaryStart || CATEGORY_TOTAL.test(t)) continue;
    if (/\b(qris|debit|card|edc|paid|ovo|gopay|dana|shopee\s?pay)\b/i.test(t)) {
      paid ??= amount;
      continue;
    }
    for (const [key, re] of SUMMARY) {
      if (!re.test(t)) continue;
      if (key === "total") summary.total = Math.max(summary.total ?? 0, amount);
      else summary[key] ??= amount;
      break;
    }
  }
  if (negatives > 0) summary.discount = (summary.discount ?? 0) + negatives;
  // An OCR-mangled amount ("10.100" read as "2-100") loses to the printed rate.
  if (summary.subtotal !== undefined) {
    const base = summary.subtotal - (summary.discount ?? 0);
    if (percents.service !== undefined) {
      const expected = Math.round((base * percents.service) / 100);
      if (summary.service === undefined || Math.abs(summary.service - expected) > expected * 0.02) summary.service = expected;
    }
    if (percents.tax !== undefined) {
      const expected = Math.round(((base + (summary.service ?? 0)) * percents.tax) / 100);
      if (summary.tax === undefined || Math.abs(summary.tax - expected) > expected * 0.02) summary.tax = expected;
    }
  }
  // "TOTAL" unreadable but "Paid QRIS 233.310" is fine: that is the total.
  if (summary.total === undefined && paid !== undefined) summary.total = paid;
  inferRates(summary, percents);

  // --- Items ----------------------------------------------------------------
  const body = lines.slice(itemsStart, summaryStart);
  const items: ParsedItem[] = [];
  const qtyIdx = body.map((l, i) => (qtyLine(l.core) ? i : -1)).filter((i) => i >= 0);
  // Layout A: the name sits on the line before or after the qty line. Pick
  // the side that explains more lines.
  const score = (dir: -1 | 1) => qtyIdx.filter((i) => body[i + dir] && isNameLike(body[i + dir])).length;
  const dir: -1 | 1 = score(1) > score(-1) ? 1 : -1;

  body.forEach((line, i) => {
    const q = qtyLine(line.core);
    if (q) {
      const before = line.core.slice(0, line.core.search(/[0-9TIil]{1,2}\s?[xX×%]\s/));
      const neighbour = body[i + dir];
      let name = neighbour && isNameLike(neighbour) ? cleanName(nameText(neighbour)) : "";
      if (!name && letters(before) >= 3) name = cleanName(before);
      items.push({ name: name || "Item", ...resolveQty(q.qty, q.unit, q.total) });
      return;
    }
    // Layout E: "1 SMOKED RICE" then "@18.000   18.000" on the next line,
    // possibly with "+Extra sauce" modifier lines around it.
    if (isPriceOnly(line)) {
      const amounts = [...line.core.matchAll(AMOUNT_ALL())]
        .map((a) => parseAmount(a[0]))
        .filter((v): v is number => v !== null && v > 0);
      const total = amounts[amounts.length - 1];
      if (!total || total < MIN_ITEM) return;
      const unit = amounts.length > 1 ? amounts[amounts.length - 2] : null;
      let nameLine: Line | null = null;
      for (let k = i - 1; k >= Math.max(0, i - 4); k--) {
        const cand = body[k];
        if (isPriceOnly(cand) || cand.amount !== null || qtyLine(cand.core)) break;
        if (/^\W*\+/.test(cand.text)) continue;
        if (isNameLike(cand) || /^\W*\d{1,2}\s+[A-Za-z]/.test(cand.core)) {
          nameLine = cand;
          break;
        }
      }
      let qty: number | null = null;
      let name = "Item";
      if (nameLine) {
        const raw = nameText(nameLine).replace(/^[^A-Za-z0-9]+/, "");
        const lead = raw.match(/^(\d{1,2})\s+(?=[A-Za-z])/);
        if (lead) qty = Number(lead[1]);
        name = cleanName(lead ? raw.slice(lead[0].length) : raw) || "Item";
      }
      items.push({ name, ...resolveQty(qty, unit, total) });
      return;
    }

    // Layouts B/C/D: one line per item.
    const { core: t, amount } = line;
    if (amount === null || amount < MIN_ITEM) return;
    if (NOISE.test(t) || isSummary(t)) return;
    let rest = t.slice(0, t.match(AMOUNT_AT_END)!.index).trim();
    let unit: number | null = null;
    let qty: number | null = null;
    const unitMatch = rest.match(new RegExp(String.raw`\s(${AMOUNT_SRC})$`));
    if (unitMatch) {
      const u = parseAmount(unitMatch[1]);
      if (u && u > 0 && u <= amount) {
        unit = u;
        rest = rest.slice(0, unitMatch.index).trim();
      } else if (u && /^\d+$/.test(unitMatch[1])) {
        // "3 5900" read as "35900": split off the qty if it makes the maths work.
        const digits = unitMatch[1];
        for (const k of [1, 2]) {
          const qq = Number(digits.slice(0, k));
          const uu = Number(digits.slice(k));
          if (qq > 0 && uu > 0 && qq * uu === amount) {
            qty = qq;
            unit = uu;
            rest = rest.slice(0, unitMatch.index).trim();
            break;
          }
        }
      }
    }
    rest = rest.replace(/^[^A-Za-z0-9]+/, "");
    if (qty === null) {
      const lead = rest.match(/^(\d{1,2})\s+(?=[A-Za-z])/);
      const trail = rest.match(/\s(\d{1,2})$/);
      if (trail) {
        qty = Number(trail[1]);
        rest = rest.slice(0, trail.index);
      } else if (lead) {
        qty = Number(lead[1]);
        rest = rest.slice(lead[0].length);
      }
    }
    const name = cleanName(rest);
    if (letters(name) < 2) return;
    items.push({ name, ...resolveQty(qty, unit, amount) });
  });

  return reconcile({
    items,
    subtotal: summary.subtotal,
    total: summary.total,
    tax: summary.tax,
    service: summary.service,
    discount: summary.discount,
    taxInclusive,
    servicePercent: percents.service,
    taxPercent: percents.tax,
  });
}

/**
 * Do the items add up to what the receipt printed? Shared by the OCR parser
 * and the LLM scan, so both are judged by the same rule.
 */
export function reconcile(r: Omit<ParsedReceipt, "check">): ParsedReceipt {
  const itemsSum = r.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const afterDiscount = itemsSum - (r.discount ?? 0);
  let taxInclusive = r.taxInclusive;
  let check: ParsedReceipt["check"] = { itemsSum, matches: false };
  if (r.subtotal !== undefined) {
    check = {
      itemsSum,
      against: "subtotal",
      expected: r.subtotal,
      matches: itemsSum === r.subtotal || afterDiscount === r.subtotal,
    };
  }
  if (!check.matches && r.total !== undefined) {
    const ok = itemsSum === r.total || afterDiscount === r.total;
    if (ok || r.subtotal === undefined) check = { itemsSum, against: "total", expected: r.total, matches: ok };
  }
  // Items already add up to the final total → tax is informational only.
  if (r.total !== undefined && (itemsSum === r.total || afterDiscount === r.total)) taxInclusive = true;
  return {
    ...r,
    tax: taxInclusive ? undefined : r.tax,
    taxPercent: taxInclusive ? undefined : r.taxPercent,
    taxInclusive,
    check,
  };
}
