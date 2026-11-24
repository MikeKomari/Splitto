import type { Bill } from "@/features/bill/types";
import type { SplitResult } from "@/features/bill/split";
import { formatRupiah } from "@/lib/money";
import { formatDate } from "@/lib/date";

export function summaryText(bill: Bill, split: SplitResult) {
  const lines = [
    `${bill.title || "Bill"} · ${formatDate(bill.date)}`,
    "",
    ...bill.people.map((p) => `${p.name}: ${formatRupiah(split.people.find((s) => s.personId === p.id)?.total ?? 0)}`),
    "",
    `Total: ${formatRupiah(split.grandTotal)}`,
    "Split with Splitto",
  ];
  return lines.join("\n");
}

/** Native share sheet on phones, clipboard elsewhere. */
export async function shareSummary(bill: Bill, split: SplitResult): Promise<"shared" | "copied" | "cancelled"> {
  const text = summaryText(bill, split);
  if (navigator.share) {
    try {
      await navigator.share({ title: bill.title || "Bill split", text });
      return "shared";
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return "cancelled";
    }
  }
  await navigator.clipboard.writeText(text);
  return "copied";
}

const fileBase = (bill: Bill) => `splitto-${(bill.title || "bill").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${bill.date}`;

async function renderPng(node: HTMLElement) {
  const { toPng } = await import("html-to-image");
  const bg = getComputedStyle(document.body).backgroundColor;
  return toPng(node, { pixelRatio: 2, backgroundColor: bg, cacheBust: true });
}

export async function saveImage(node: HTMLElement, bill: Bill) {
  const url = await renderPng(node);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileBase(bill)}.png`;
  a.click();
}

export async function savePdf(node: HTMLElement, bill: Bill) {
  const [url, { jsPDF }] = await Promise.all([renderPng(node), import("jspdf")]);
  const img = new Image();
  img.src = url;
  await img.decode();
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth() - 20;
  const h = (img.height * w) / img.width;
  pdf.addImage(url, "PNG", 10, 10, w, Math.min(h, pdf.internal.pageSize.getHeight() - 20));
  pdf.save(`${fileBase(bill)}.pdf`);
}
