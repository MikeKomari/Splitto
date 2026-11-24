/**
 * GET  /api/scan → { llm: boolean, mode }      (what the app should do)
 * POST /api/scan  { image: "data:image/jpeg;base64,..." } → { receipt }
 *
 * Vercel function (Web Request/Response). Also served by the Vite dev server.
 */
import { callLlm, rateLimited, scanConfig, UpstreamError } from "./_lib/llmScan.js";

const MAX_IMAGE_CHARS = 6 * 1024 * 1024; // ~4.5 MB of image after base64
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function GET() {
  const cfg = scanConfig();
  return json({ llm: cfg.enabled, mode: cfg.mode });
}

export async function POST(request: Request) {
  const cfg = scanConfig();
  if (!cfg.enabled) return json({ error: "AI scanning is not configured." }, 503);

  // Only our own pages may call this (blocks other sites spending credits from a visitor's browser).
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ error: "Forbidden" }, 403);

  const ip = (request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (rateLimited(ip, cfg.ratePerHour)) return json({ error: "Too many AI scans. Try again later." }, 429);

  let image: unknown;
  try {
    ({ image } = (await request.json()) as { image?: unknown });
  } catch {
    return json({ error: "Send JSON: { image }" }, 400);
  }
  if (typeof image !== "string" || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))
    return json({ error: "image must be a JPEG, PNG or WebP data URL" }, 400);
  if (image.length > MAX_IMAGE_CHARS) return json({ error: "Image too large" }, 413);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 50_000);
  try {
    const receipt = await callLlm(image, cfg, ctrl.signal);
    return json({ receipt, model: cfg.model });
  } catch (e) {
    // Never echo provider bodies (could include account details); log status only.
    const status = e instanceof UpstreamError ? e.status : 0;
    console.error("scan: LLM failed", status || (e as Error).name);
    return json({ error: "AI scan failed" }, status === 429 ? 429 : 502);
  } finally {
    clearTimeout(timer);
  }
}
