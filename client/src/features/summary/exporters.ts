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

export const fileBase = (bill: Bill) =>
  `splitto-${(bill.title || "bill").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${bill.date}`;

/** The share card is always light, so the background is fixed too. */
export async function renderPng(node: HTMLElement) {
  const { toPng } = await import("html-to-image");
  // First call warms fonts/images inside html-to-image; the second is crisp.
  await toPng(node, { pixelRatio: 1, backgroundColor: "#FBFAFD" }).catch(() => undefined);
  return toPng(node, { pixelRatio: 3, backgroundColor: "#FBFAFD", cacheBust: true });
}

export async function pngFile(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], `${name}.png`, { type: "image/png" });
}

/** Phones: share sheet with the image ("Save Image", WhatsApp…). Else: download. */
export async function saveOrShareImage(dataUrl: string, bill: Bill): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = await pngFile(dataUrl, fileBase(bill));
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: bill.title || "Bill split" });
      return "shared";
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return "cancelled";
    }
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = file.name;
  a.click();
  return "downloaded";
}

export async function savePdf(dataUrl: string, bill: Bill) {
  const { jsPDF } = await import("jspdf");
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  // Fit the whole card on one page, centred.
  const scale = Math.min((pageW - 20) / img.width, (pageH - 20) / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  pdf.addImage(dataUrl, "PNG", (pageW - w) / 2, 10, w, h);
  pdf.save(`${fileBase(bill)}.pdf`);
}
