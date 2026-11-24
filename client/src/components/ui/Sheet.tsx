import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./Button";

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode };

/** Mobile bottom sheet; becomes a centred dialog on wide screens. */
export function Sheet({ open, onClose, title, children, footer }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("input,button:not([data-close])")?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="animate-fade-in absolute inset-0 bg-night/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-sheet-up relative flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-[24px] bg-surface shadow-pop sm:rounded-[24px]"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2 className="text-[20px] leading-7">{title}</h2>
          <IconButton label="Close" data-close onClick={onClose} className="-mr-2">
            <X className="h-5 w-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="safe-bottom border-t border-border px-5 pt-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
