import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, ArrowLeft, CheckCircle2, ImageUp, PenLine, RefreshCcw, SwitchCamera, Zap, ZapOff } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Money } from "@/components/ui/AnimatedNumber";
import { preloadOcr, recognizeReceipt, type OcrProgress } from "@/features/scan/ocr/ocrEngine";
import { parseReceipt, type ParsedReceipt } from "@/features/scan/receiptParser";
import { receiptToBill } from "@/features/scan/toBill";
import { better, getScanConfig, llmScan, LlmScanError } from "@/features/scan/llmScan";
import { useDraft } from "@/store/draftStore";
import { useStartManual } from "@/features/bill/useStartManual";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/cn";

type Phase =
  | { kind: "camera" }
  | { kind: "reading"; progress: OcrProgress | null; via: "ocr" | "ai" }
  | { kind: "done"; result: ParsedReceipt; via: "ocr" | "ai"; note?: string }
  | { kind: "failed"; message: string };

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_BYTES = 15 * 1024 * 1024;

export default function Scan() {
  const navigate = useNavigate();
  const start = useDraft((s) => s.start);
  const startManual = useStartManual();
  const video = useRef<HTMLVideoElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runId = useRef(0);

  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torch, setTorch] = useState<{ supported: boolean; on: boolean }>({ supported: false, on: false });
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "camera" });
  const [flash, setFlash] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser can't open the camera. Upload a photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (video.current) video.current.srcObject = stream;
      const caps = stream.getVideoTracks()[0]?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
      setTorch({ supported: !!caps?.torch, on: false });
    } catch {
      setCameraError("Camera access was blocked. Allow it in your browser settings, or upload a photo.");
    }
  }, [facing, stopCamera]);

  useEffect(() => {
    preloadOcr();
  }, []);

  useEffect(() => {
    if (phase.kind === "camera" && !photo) void startCamera();
    return stopCamera;
  }, [phase.kind, photo, startCamera, stopCamera]);

  useEffect(() => () => void (photo && URL.revokeObjectURL(photo.url)), [photo]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch.on } as MediaTrackConstraintSet] });
      setTorch((t) => ({ ...t, on: !t.on }));
    } catch {
      setTorch({ supported: false, on: false });
    }
  };

  /**
   * Free OCR first. If the server has an LLM configured (SCAN_MODE=auto) and
   * the OCR items don't add up to the receipt, ask the LLM and keep the better
   * read. SCAN_MODE=llm skips OCR. Any LLM failure falls back to OCR.
   */
  const process = async (blob: Blob) => {
    const id = ++runId.current;
    const live = () => id === runId.current;
    const cfg = await getScanConfig();
    const viaAi = async () => {
      setPhase({ kind: "reading", progress: null, via: "ai" });
      return llmScan(blob);
    };
    const viaOcr = async () => {
      setPhase({ kind: "reading", progress: null, via: "ocr" });
      const { text } = await recognizeReceipt(blob, (p) => live() && setPhase({ kind: "reading", progress: p, via: "ocr" }));
      return parseReceipt(text);
    };
    const aiError = (e: unknown) =>
      e instanceof LlmScanError && e.status === 429 ? "AI scan limit reached, showing the on-device result." : "AI scan unavailable, showing the on-device result.";

    try {
      let result: ParsedReceipt;
      let via: "ocr" | "ai" = "ocr";
      let note: string | undefined;
      if (cfg.llm && cfg.mode === "llm") {
        try {
          result = await viaAi();
          via = "ai";
        } catch (e) {
          if (!live()) return;
          note = aiError(e);
          result = await viaOcr();
        }
      } else {
        result = await viaOcr();
        if (live() && cfg.llm && cfg.mode === "auto" && !result.check.matches) {
          try {
            const ai = await viaAi();
            const pick = better(result, ai);
            if (pick === ai) via = "ai";
            result = pick;
          } catch (e) {
            note = aiError(e);
          }
        }
      }
      if (!live()) return;
      if (result.items.length === 0) {
        setPhase({ kind: "failed", message: "We couldn't find any items on this photo." });
        return;
      }
      navigator.vibrate?.(12);
      setPhase({ kind: "done", result, via, note });
    } catch (e) {
      if (!live()) return;
      console.error(e);
      setPhase({ kind: "failed", message: "Reading the receipt failed. Check your connection for the first scan, then try again." });
    }
  };

  const handlePhoto = (blob: Blob) => {
    stopCamera();
    setPhoto({ blob, url: URL.createObjectURL(blob) });
    void process(blob);
  };

  const capture = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")!.drawImage(v, 0, 0);
    canvas.toBlob((b) => b && handlePhoto(b), "image/jpeg", 0.92);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type && !ACCEPTED.includes(f.type)) return void toast.error("Please choose a JPG, PNG or HEIC photo.");
    if (f.size > MAX_BYTES) return void toast.error("That photo is over 15 MB.");
    handlePhoto(f);
  };

  const retake = () => {
    runId.current++;
    setPhoto(null);
    setPhase({ kind: "camera" });
  };

  const review = () => {
    if (phase.kind !== "done") return;
    start(receiptToBill(phase.result));
    navigate("/bill/items", { replace: true });
  };

  const reading = phase.kind === "reading";
  const pct = reading && phase.progress ? Math.round((phase.progress.stage === "loading" ? phase.progress.progress * 0.2 : 0.2 + phase.progress.progress * 0.8) * 100) : 0;

  return (
    <div className="fixed inset-0 overflow-hidden bg-night text-star-white">
      {/* Camera / photo */}
      <div className="absolute inset-0 flex items-center justify-center">
        {photo ? (
          <div className="relative h-full w-full">
            <img src={photo.url} alt="Your receipt" className={cn("h-full w-full object-contain transition-all duration-500", reading && "scale-[0.96] opacity-80")} />
            {reading && (
              <div className="absolute inset-[6%] overflow-hidden rounded-[18px]">
                <span className="animate-scan-sweep absolute inset-x-0 h-16 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#A283E6]/40 to-transparent" />
                <span className="animate-scan-sweep absolute inset-x-0 h-[2px] bg-[#C3B0F0] shadow-[0_0_16px_#A283E6]" />
              </div>
            )}
          </div>
        ) : cameraError ? (
          <div className="animate-page-in mx-6 max-w-sm rounded-[20px] bg-white/5 p-6 text-center">
            <ImageUp className="mx-auto h-10 w-10 text-star-silver" />
            <p className="mt-3 text-[14px] text-star-silver">{cameraError}</p>
            <Button className="mt-5" onClick={() => fileInput.current?.click()}>
              Upload a photo
            </Button>
          </div>
        ) : (
          <>
            <video ref={video} autoPlay playsInline muted className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[68%] w-[72%] max-w-[340px] rounded-[18px] shadow-[0_0_0_9999px_rgba(15,13,20,0.45)]">
                {["left-0 top-0 border-l-4 border-t-4 rounded-tl-[18px]", "right-0 top-0 border-r-4 border-t-4 rounded-tr-[18px]", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-[18px]", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-[18px]"].map((c) => (
                  <span key={c} className={cn("animate-bracket absolute h-10 w-10 border-[#C3B0F0]", c)} />
                ))}
                <span className="animate-scan-sweep absolute inset-x-3 h-[2px] rounded bg-[#C3B0F0]/80 shadow-[0_0_12px_#A283E6]" />
              </div>
            </div>
            <p className="absolute inset-x-0 top-[13%] text-center text-[13px] text-star-silver">Fit the whole receipt inside the frame</p>
          </>
        )}
      </div>
      {flash && <div className="animate-fade-in absolute inset-0 bg-white/80" />}

      {/* Top bar */}
      <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-night/70 to-transparent px-3 pb-6">
        <IconButton label="Close scanner" onClick={() => navigate("/app")} className="text-star-white hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold">Receipt scanner</span>
        {!photo && !cameraError ? (
          <IconButton label="Switch camera" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} className="text-star-white hover:bg-white/10">
            <SwitchCamera className="h-5 w-5" />
          </IconButton>
        ) : (
          <span className="w-11" />
        )}
      </div>

      {/* Reading progress */}
      {reading && (
        <div className="animate-page-in absolute inset-x-0 bottom-0 safe-bottom px-6 pb-6">
          <div className="mx-auto max-w-sm rounded-[20px] bg-night/85 p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48" aria-hidden>
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#A283E6" strokeWidth="4" strokeLinecap="round" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - (phase.via === "ai" ? 0.5 : pct / 100))} className="transition-[stroke-dashoffset] duration-300" />
              </svg>
              <div aria-live="polite">
                <p className="font-semibold">{phase.via === "ai" ? "Reading with AI…" : phase.progress?.stage === "reading" ? "Reading items…" : "Getting the scanner ready…"}</p>
                <p className="text-[12px] text-star-silver">{phase.via === "ai" ? "Double-checking with AI" : `${pct}% · stays on your phone`}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera controls */}
      {!photo && (
        <div className="safe-bottom absolute inset-x-0 bottom-0 flex items-center justify-center gap-10 bg-gradient-to-t from-night/80 to-transparent pb-8 pt-10">
          <IconButton label="Upload a photo" onClick={() => fileInput.current?.click()} className="h-12 w-12 rounded-full bg-white/10 text-star-white hover:bg-white/20">
            <ImageUp className="h-5 w-5" />
          </IconButton>
          <button
            onClick={capture}
            disabled={!!cameraError}
            aria-label="Take photo"
            className="pressable flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-star-white/90 disabled:opacity-40 cursor-pointer"
          >
            <span className="h-[58px] w-[58px] rounded-full bg-star-white transition-transform active:scale-90" />
          </button>
          <IconButton
            label={torch.on ? "Turn torch off" : "Turn torch on"}
            onClick={toggleTorch}
            disabled={!torch.supported}
            className={cn("h-12 w-12 rounded-full text-star-white", torch.on ? "bg-star text-on-star" : "bg-white/10 hover:bg-white/20")}
          >
            {torch.on ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
          </IconButton>
        </div>
      )}

      {/* Result sheet */}
      {(phase.kind === "done" || phase.kind === "failed") && (
        <div className="animate-sheet-up safe-bottom absolute inset-x-0 bottom-0 rounded-t-[28px] bg-surface px-5 pt-5 text-text shadow-pop">
          <div className="mx-auto max-w-md">
            {phase.kind === "done" ? (
              <ResultSummary result={phase.result} via={phase.via} note={phase.note} />
            ) : (
              <div className="animate-shake text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
                <p className="mt-2 font-semibold">{phase.message}</p>
                <p className="mt-1 text-[13px] text-muted">Try a flat, well-lit photo with the whole receipt in view.</p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="secondary" size="lg" onClick={retake}>
                <RefreshCcw className="h-4 w-4" /> Retake
              </Button>
              {phase.kind === "done" ? (
                <Button size="lg" onClick={review}>
                  Review items
                </Button>
              ) : (
                <Button size="lg" onClick={startManual}>
                  <PenLine className="h-4 w-4" /> Type it in
                </Button>
              )}
            </div>
            <div className="h-2" />
          </div>
        </div>
      )}

      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}

function ResultSummary({ result, via, note }: { result: ParsedReceipt; via: "ocr" | "ai"; note?: string }) {
  const { check } = result;
  const count = result.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <div className="text-center">
      <p className="text-[13px] text-muted">
        Found {result.items.length} lines · {count} items{via === "ai" && " · read by AI"}
      </p>
      <p className="mt-1 font-display text-[32px] font-semibold leading-10">
        <Money value={result.total ?? check.itemsSum} />
      </p>
      {check.matches ? (
        <p className="animate-pop-in mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--tile-3)] px-3 py-1 text-[12px] font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" /> Items match the receipt {check.against}
        </p>
      ) : (
        <p className="animate-pop-in mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-[12px] font-semibold text-warning">
          <AlertTriangle className="h-4 w-4" />
          {check.expected
            ? `Items add to ${formatRupiah(check.itemsSum)}, receipt says ${formatRupiah(check.expected)}`
            : "Couldn't find the receipt total: please check items"}
        </p>
      )}
      {note && <p className="mt-2 text-[12px] text-muted">{note}</p>}
    </div>
  );
}
