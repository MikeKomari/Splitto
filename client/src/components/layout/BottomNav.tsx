import { NavLink, useNavigate } from "react-router-dom";
import { ChartColumn, House, PenLine, ScanLine, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStartManual } from "@/features/bill/useStartManual";

const item = "pressable flex h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold";

function Tab({ to, label, icon: Icon }: { to: string; label: string; icon: typeof House }) {
  return (
    <NavLink to={to} end className={({ isActive }) => cn(item, isActive ? "text-primary" : "text-muted hover:text-text")}>
      {({ isActive }) => (
        <>
          <Icon className={cn("h-[22px] w-[22px] transition-transform duration-200", isActive && "-translate-y-0.5")} strokeWidth={isActive ? 2.2 : 1.8} />
          <span className={cn("h-1 w-1 rounded-full bg-primary transition-opacity", isActive ? "opacity-100" : "opacity-0")} />
          <span className="sr-only">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const startManual = useStartManual();
  return (
    <nav aria-label="Main" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center px-3 pt-1.5">
        <Tab to="/app" label="Home" icon={House} />
        <Tab to="/app/activity" label="Activity" icon={ChartColumn} />
        <div className="flex flex-1 justify-center">
          <button
            onClick={() => navigate("/scan")}
            aria-label="Scan a receipt"
            className="pressable -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-night text-star-white shadow-pop ring-4 ring-bg dark:bg-primary dark:text-on-primary cursor-pointer hover:scale-105 transition-transform"
          >
            <ScanLine className="h-6 w-6" />
          </button>
        </div>
        <button onClick={startManual} className={cn(item, "text-muted hover:text-text cursor-pointer")}>
          <PenLine className="h-[22px] w-[22px]" strokeWidth={1.8} />
          <span className="h-1 w-1" />
          <span className="sr-only">Enter a bill by hand</span>
        </button>
        <Tab to="/app/friends" label="Friends" icon={Users} />
      </div>
    </nav>
  );
}
