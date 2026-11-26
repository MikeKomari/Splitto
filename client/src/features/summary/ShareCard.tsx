import { forwardRef } from "react";
import type { Bill } from "@/features/bill/types";
import type { SplitResult } from "@/features/bill/split";
import { SummaryBody } from "./SummaryBody";

/**
 * What the exported image looks like: always light, fixed width, everyone
 * expanded, comfortable margins, Splitto branding at the bottom. Rendered
 * off-screen only while exporting, so the visible page never reflows.
 */
export const ShareCard = forwardRef<HTMLDivElement, { bill: Bill; split: SplitResult }>(function ShareCard({ bill, split }, ref) {
  return (
    <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0">
      <div ref={ref} className="theme-light no-motion w-[440px] bg-bg px-6 pb-5 pt-6 text-text font-sans">
        <SummaryBody bill={bill} split={split} open="all" />
        <footer className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}Splitto_logo.png`} alt="" className="h-7 w-7 rounded-[8px]" />
            <span className="leading-tight">
              <span className="block font-display text-[14px] font-semibold">Split with Splitto</span>
              <span className="block text-[11px] text-muted">Fair to the last rupiah</span>
            </span>
          </span>
          <span className="text-right text-[11px] leading-tight text-muted">
            © {new Date().getFullYear()} Splitto
            <br />
            {typeof window !== "undefined" && window.location.protocol.startsWith("http") ? window.location.host : ""}
          </span>
        </footer>
      </div>
    </div>
  );
});
