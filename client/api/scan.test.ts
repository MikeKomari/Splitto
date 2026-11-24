import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { extractJson, rateLimited, validateReceipt } from "./_lib/llmScan";

const IMG = "data:image/jpeg;base64,/9j/AAAA";
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://app.test/api/scan", {
    method: "POST",
    headers: { "content-type": "application/json", host: "app.test", ...headers },
    body: JSON.stringify(body),
  });

describe("validateReceipt (model output is untrusted)", () => {
  it("keeps well-formed fields and clamps the rest", () => {
    const r = validateReceipt({
      items: [
        { name: "SMOKED RICE", quantity: 1, unit_price: 18000 },
        { name: "<img src=x onerror=alert(1)>Tea", quantity: 500, unit_price: 5000 },
        { name: "", quantity: 1, unit_price: 1000 },
        { name: "Free", quantity: 1, unit_price: -5 },
      ],
      subtotal: 23000,
      service_percent: 5,
      tax_percent: 999,
      total: "lots",
    });
    expect(r.items).toEqual([
      { name: "SMOKED RICE", quantity: 1, unitPrice: 18000 },
      { name: "img src=x onerror=alert(1)Tea", quantity: 99, unitPrice: 5000 },
    ]);
    expect(r).toMatchObject({ subtotal: 23000, servicePercent: 5, taxPercent: undefined, total: undefined });
  });

  it("extracts JSON from fenced or chatty output", () => {
    expect(extractJson('```json\n{"items":[]}\n```')).toEqual({ items: [] });
    expect(extractJson('Sure! {"a":1} hope it helps')).toEqual({ a: 1 });
    expect(() => extractJson("no json")).toThrow();
  });
});

describe("rateLimited (sliding window per IP)", () => {
  it("allows N per hour, then blocks, then frees up", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimited("1.1.1.1", 3, t0 + i)).toBe(false);
    expect(rateLimited("1.1.1.1", 3, t0 + 10)).toBe(true);
    expect(rateLimited("2.2.2.2", 3, t0 + 10)).toBe(false);
    expect(rateLimited("1.1.1.1", 3, t0 + 3_600_001)).toBe(false);
  });
});

describe("/api/scan handler", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.LLM_API_KEY = "test-key";
    for (const k of ["SCAN_MODE", "LLM_BASE_URL", "LLM_MODEL", "SCAN_RATE_LIMIT"]) delete process.env[k];
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.LLM_API_KEY;
  });

  it("GET reports whether the LLM is on, never the key", async () => {
    const { GET } = await import("./scan");
    const body = await (await GET()).json();
    expect(body).toEqual({ llm: true, mode: "auto" });
    delete process.env.LLM_API_KEY;
    expect(await (await GET()).json()).toEqual({ llm: false, mode: "ocr" });
  });

  it("calls the provider with the key and returns validated items", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: '{"items":[{"name":"Tea","quantity":2,"unit_price":5000}],"subtotal":10000}' } }] }))
    );
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./scan");
    const res = await POST(req({ image: IMG }, { "x-real-ip": "9.9.9.1" }));
    expect(res.status).toBe(200);
    expect((await res.json()).receipt.items).toEqual([{ name: "Tea", quantity: 2, unitPrice: 5000 }]);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://inference-api.nousresearch.com/v1/chat/completions");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer test-key");
  });

  it("rejects other websites, bad images, and hides provider errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("account xyz out of credits", { status: 402 })));
    const { POST } = await import("./scan");
    expect((await POST(req({ image: IMG }, { origin: "https://evil.test", "x-real-ip": "9.9.9.2" }))).status).toBe(403);
    expect((await POST(req({ image: "javascript:alert(1)" }, { "x-real-ip": "9.9.9.3" }))).status).toBe(400);
    const res = await POST(req({ image: IMG }, { "x-real-ip": "9.9.9.4" }));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("account");
  });

  it("returns 429 after SCAN_RATE_LIMIT scans from one IP", async () => {
    process.env.SCAN_RATE_LIMIT = "2";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"items":[]}' } }] }))));
    const { POST } = await import("./scan");
    const codes = [];
    for (let i = 0; i < 3; i++) codes.push((await POST(req({ image: IMG }, { "x-real-ip": "7.7.7.7" }))).status);
    expect(codes).toEqual([200, 200, 429]);
    delete process.env.SCAN_RATE_LIMIT;
  });
});
