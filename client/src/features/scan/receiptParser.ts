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
  ["tax", /\bp[abd8]\s?[1il]\b|\bpbi\b|\bpajak|\btax\b|\bppn\b/i],
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
    const next = t.replace(/\s+[^\d\s]{1,4}$/, "");
    if (next === t) break;
    t = next;
  }
  return t;
}

type Line = { text: string; core: string; amount: number | null };

/** Name lines keep real short words ("Udon", "Ocha"); only 1–2 char crumbs go. */
function nameText(line: Line) {
  return line.text.replace(/(\s+(?:[^\sA-Za-z0-9]{1,2}|[A-Za-z]))+$/, "");
}

function letters(s: string) {
  return (s.match(/[A-Za-z]/g) ?? []).length;
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
  let negatives = 0;
  for (let i = itemsStart; i < lines.length; i++) {
    const { core: t, amount } = lines[i];
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
    for (const [key, re] of SUMMARY) {
      if (!re.test(t)) continue;
      if (key === "total") summary.total = Math.max(summary.total ?? 0, amount);
      else summary[key] ??= amount;
      break;
    }
  }
  if (negatives > 0) summary.discount = (summary.discount ?? 0) + negatives;

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

  // --- Reconciliation -------------------------------------------------------
  const itemsSum = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const afterDiscount = itemsSum - (summary.discount ?? 0);
  let check: ParsedReceipt["check"] = { itemsSum, matches: false };
  if (summary.subtotal !== undefined) {
    check = {
      itemsSum,
      against: "subtotal",
      expected: summary.subtotal,
      matches: itemsSum === summary.subtotal || afterDiscount === summary.subtotal,
    };
  }
  if (!check.matches && summary.total !== undefined) {
    const ok = itemsSum === summary.total || afterDiscount === summary.total;
    if (ok || summary.subtotal === undefined)
      check = { itemsSum, against: "total", expected: summary.total, matches: ok };
  }
  // Items already add up to the final total → tax is informational only.
  if (summary.total !== undefined && (itemsSum === summary.total || afterDiscount === summary.total))
    taxInclusive = true;

  return {
    items,
    subtotal: summary.subtotal,
    total: summary.total,
    tax: taxInclusive ? undefined : summary.tax,
    service: summary.service,
    discount: summary.discount,
    taxInclusive,
    check,
  };
}
