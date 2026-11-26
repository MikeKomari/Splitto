import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, Share2, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";

type Props = {
  src: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  canShareFiles: boolean;
};

/**
 * Opens the finished image straight away, full screen. On phones the main
 * button opens the share sheet ("Save Image", WhatsApp…); press-and-hold on
 * the picture also saves it, which works even where downloads are blocked.
 */
export function ImageViewer({ src, onClose, onSave, saving, canShareFiles }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Bill image" className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-night">
      <div className="safe-top flex items-center justify-between px-3 pb-2 text-star-white">
        <p className="pl-2 text-[14px] font-semibold">Your bill image</p>
        <IconButton label="Close" onClick={onClose} className="text-star-white hover:bg-white/10">
          <X className="h-5 w-5" />
        </IconButton>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <img src={src} alt="Bill split summary" className="animate-pop-in mx-auto w-full max-w-[440px] rounded-[16px] shadow-pop" />
      </div>
      <div className="safe-bottom border-t border-white/10 px-4 pt-3">
        <div className="mx-auto max-w-[440px]">
          <Button size="lg" block onClick={onSave} loading={saving}>
            {canShareFiles ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {canShareFiles ? "Save or share image" : "Download image"}
          </Button>
          <p className="mt-2 text-center text-[12px] text-star-silver">Or press and hold the picture to save it.</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
