/**
 * On-device receipt OCR with Tesseract (WASM). No server, no API key, no
 * per-scan cost. All assets are self-hosted under /ocr (see
 * scripts/copy-ocr-assets.mjs) and cached by the service worker after the
 * first scan, so later scans also work offline.
 */
import { createWorker, PSM, type Worker } from "tesseract.js";
import { binarize, targetSize, type RawImage } from "./preprocess";

export type OcrProgress = { stage: "loading" | "reading"; progress: number };
export type OcrResult = { text: string; confidence: number; rotation: 0 | 90 | 270 };

/** Below this Tesseract confidence we retry the photo turned sideways. */
const RETRY_BELOW = 55;

let workerPromise: Promise<Worker> | null = null;

/**
 * Normally the worker script is loaded straight from /ocr. Hosts that refuse
 * to serve ".gz" files (the claude.ai preview) set VITE_OCR_MODEL_EXT, and the
 * model is published with that extra extension; a tiny wrapper worker
 * rewrites that single fetch.
 */
function workerSource(base: string) {
  const ext = import.meta.env.VITE_OCR_MODEL_EXT;
  if (!ext) return { workerPath: `${base}/ocr/worker.min.js` };
  const shim =
    `const f=self.fetch.bind(self);` +
    `self.fetch=(u,o)=>f(String(u).endsWith(".traineddata.gz")?String(u)+${JSON.stringify(ext)}:u,o);` +
    `importScripts(${JSON.stringify(`${base}/ocr/worker.min.js`)});`;
  return {
    workerPath: URL.createObjectURL(new Blob([shim], { type: "text/javascript" })),
    workerBlobURL: false,
  };
}
let onProgress: ((p: OcrProgress) => void) | null = null;

function getWorker() {
  if (!workerPromise) {
    // Absolute URLs: the worker resolves relative paths against its own URL.
    const base = new URL(import.meta.env.BASE_URL, document.baseURI).href.replace(/\/$/, "");
    workerPromise = createWorker("eng", 1, {
      ...workerSource(base),
      corePath: `${base}/ocr/core`,
      langPath: `${base}/ocr/lang`,
      logger: (m) => {
        if (!onProgress) return;
        if (m.status === "recognizing text") onProgress({ stage: "reading", progress: m.progress });
        else onProgress({ stage: "loading", progress: m.progress });
      },
    }).then(async (w) => {
      await w.setParameters({
        // One uniform block of text: how receipts are laid out.
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: "1",
      });
      return w;
    });
    // A failed load must not poison every later attempt.
    workerPromise.catch(() => (workerPromise = null));
  }
  return workerPromise;
}

/** Warm the worker while the user is still framing the shot. */
export function preloadOcr() {
  void getWorker().catch(() => undefined);
}

async function loadBitmap(file: Blob) {
  // imageOrientation honours EXIF rotation from phone cameras.
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function render(bitmap: ImageBitmap, rotation: 0 | 90 | 270): RawImage {
  const turned = rotation !== 0;
  const srcW = turned ? bitmap.height : bitmap.width;
  const srcH = turned ? bitmap.width : bitmap.height;
  const { width, height } = targetSize(srcW, srcH);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  const drawW = turned ? height : width;
  const drawH = turned ? width : height;
  ctx.drawImage(bitmap, -drawW / 2, -drawH / 2, drawW, drawH);
  const { data } = ctx.getImageData(0, 0, width, height);
  return { data, width, height };
}

function toCanvas(img: RawImage) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(img.data), img.width, img.height), 0, 0);
  return canvas;
}

export async function recognizeReceipt(file: Blob, progress?: (p: OcrProgress) => void): Promise<OcrResult> {
  onProgress = progress ?? null;
  try {
    const [worker, bitmap] = await Promise.all([getWorker(), loadBitmap(file)]);
    let best: OcrResult | null = null;
    for (const rotation of [0, 270, 90] as const) {
      const canvas = toCanvas(binarize(render(bitmap, rotation)));
      const { data } = await worker.recognize(canvas);
      if (!best || data.confidence > best.confidence) best = { text: data.text, confidence: data.confidence, rotation };
      if (data.confidence >= RETRY_BELOW) break;
    }
    bitmap.close();
    return best!;
  } finally {
    onProgress = null;
  }
}
