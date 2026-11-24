import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const STEPS = ["Items", "People", "Split"] as const;

/** Top bar for the 3-step bill flow, with a progress stepper. */
export function FlowHeader({ step, title, right, back }: { step: 0 | 1 | 2; title: string; right?: ReactNode; back?: string }) {
  const navigate = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-20 -mx-4 mb-4 border-b border-border bg-bg/90 px-4 pb-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <IconButton label="Back" onClick={() => (back ? navigate(back) : navigate(-1))} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <h1 className="text-[17px] leading-6">{title}</h1>
        <div className="flex min-w-11 justify-end">{right}</div>
      </div>
      <ol className="mt-2 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2" aria-current={i === step ? "step" : undefined}>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors duration-300",
                i < step && "bg-primary text-on-primary",
                i === step && "bg-primary-subtle text-primary-subtle-text ring-2 ring-primary",
                i > step && "bg-surface-raised text-muted"
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("text-[12px] font-semibold", i === step ? "text-text" : "text-muted")}>{s}</span>
            {i < STEPS.length - 1 && (
              <span className="relative h-[2px] flex-1 overflow-hidden rounded bg-border">
                <span
                  className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: i < step ? "100%" : "0%" }}
                />
              </span>
            )}
          </li>
        ))}
      </ol>
    </header>
  );
}

export function StickyCta({ children }: { children: ReactNode }) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto max-w-md px-4 pt-3">{children}</div>
    </div>
  );
}
