/**
 * Optional AI scan through our own /api/scan function (Vercel). The model and
 * provider are chosen by server environment variables; the browser never sees
 * the API key. See api/_lib/llmScan.ts.
 */
import { reconcile, type ParsedReceipt } from "./receiptParser";

export type ScanConfig = { llm: boolean; mode: "ocr" | "auto" | "llm" };
const OFF: ScanConfig = { llm: false, mode: "ocr" };

let configPromise: Promise<ScanConfig> | null = null;

/** What the server allows. Anything unexpected means "OCR only". */
export function getScanConfig(): Promise<ScanConfig> {
  configPromise ??= fetch("/api/scan", { headers: { accept: "application/json" } })
    .then((r) => (r.ok && r.headers.get("content-type")?.includes("json") ? r.json() : OFF))
    .then((c: ScanConfig) => (c && typeof c.llm === "boolean" ? c : OFF))
    .catch(() => OFF);
  return configPromise;
}

/** Downscale to ≤1600px JPEG: plenty for receipt text, ~5–10× fewer bytes and image tokens. */
async function toDataUrl(file: Blob, maxSide = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export class LlmScanError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ServerReceipt = Omit<ParsedReceipt, "check">;

export async function llmScan(file: Blob, signal?: AbortSignal): Promise<ParsedReceipt> {
  const image = await toDataUrl(file);
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ image }),
    signal,
  });
  const body = (await res.json().catch(() => ({}))) as { receipt?: ServerReceipt; error?: string };
  if (!res.ok || !body.receipt) throw new LlmScanError(res.status, body.error ?? "AI scan failed");
  return reconcile(body.receipt);
}

/** Pick the better of two reads: one that reconciles wins, then the one with more items. */
export function better(a: ParsedReceipt, b: ParsedReceipt) {
  if (a.check.matches !== b.check.matches) return a.check.matches ? a : b;
  return b.items.length > a.items.length ? b : a;
}
