import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Download, FileText, Share2 } from "lucide-react";
import type { Bill } from "@/features/bill/types";
import { computeSplit } from "@/features/bill/split";
import { Button } from "@/components/ui/Button";
import { SummaryBody } from "./SummaryBody";
import { ShareCard } from "./ShareCard";
import { ImageViewer } from "./ImageViewer";
import { fileBase, pngFile, renderPng, saveOrShareImage, savePdf, shareSummary } from "./exporters";

export function SplitSummary({ bill, celebrate }: { bill: Bill; celebrate?: boolean }) {
  const split = useMemo(() => computeSplit(bill), [bill]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<"img" | "pdf" | "save" | null>(null);
  const [exporting, setExporting] = useState(false);
  const [image, setImage] = useState<{ src: string; canShareFiles: boolean } | null>(null);
  const card = useRef<HTMLDivElement>(null);

  /** Mount the off-screen share card, wait for fonts/images, render it. */
  const capture = async () => {
    setExporting(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await document.fonts?.ready;
    await Promise.all([...(card.current?.querySelectorAll("img") ?? [])].map((i) => (i.complete ? null : i.decode().catch(() => null))));
    try {
      return await renderPng(card.current!);
    } finally {
      setExporting(false);
    }
  };

  const openImage = async () => {
    setBusy("img");
    try {
      const src = await capture();
      const file = await pngFile(src, fileBase(bill));
      setImage({ src, canShareFiles: !!navigator.canShare?.({ files: [file] }) });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't create the image. Try a screenshot instead.");
    } finally {
      setBusy(null);
    }
  };

  const pdf = async () => {
    setBusy("pdf");
    try {
      await savePdf(await capture(), bill);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't create the PDF.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <SummaryBody
        bill={bill}
        split={split}
        open={open}
        celebrate={celebrate}
        onToggle={(id) =>
          setOpen((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onToggleAll={() => setOpen(open.size === bill.people.length ? new Set() : new Set(bill.people.map((p) => p.id)))}
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          onClick={async () => {
            const r = await shareSummary(bill, split).catch(() => null);
            if (r === "copied") toast.success("Copied to clipboard");
            if (r === null) toast.error("Sharing isn't available here.");
          }}
        >
          <Share2 className="h-4 w-4" /> Text
        </Button>
        <Button variant="secondary" loading={busy === "img"} disabled={!!busy} onClick={openImage}>
          {busy !== "img" && <Download className="h-4 w-4" />} Image
        </Button>
        <Button variant="secondary" loading={busy === "pdf"} disabled={!!busy} onClick={pdf}>
          {busy !== "pdf" && <FileText className="h-4 w-4" />} PDF
        </Button>
      </div>

      {exporting && <ShareCard ref={card} bill={bill} split={split} />}
      {image && (
        <ImageViewer
          src={image.src}
          canShareFiles={image.canShareFiles}
          saving={busy === "save"}
          onClose={() => setImage(null)}
          onSave={async () => {
            setBusy("save");
            try {
              const r = await saveOrShareImage(image.src, bill);
              if (r === "downloaded") toast.success("Image downloaded");
            } catch {
              toast.error("Saving was blocked. Press and hold the picture instead.");
            } finally {
              setBusy(null);
            }
          }}
        />
      )}
    </>
  );
}
