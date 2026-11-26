import { Moon, Sun, SunMoon } from "lucide-react";
import { usePrefs, type ThemePref } from "@/store/historyStore";
import { cn } from "@/lib/cn";

const OPTIONS: Array<{ value: ThemePref; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: SunMoon },
];

/** Light / Dark / Auto (follow the phone). Light is the default. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);
  const idx = OPTIONS.findIndex((o) => o.value === theme);
  return (
    <div role="radiogroup" aria-label="Theme" className={cn("relative inline-grid h-9 grid-cols-3 rounded-full bg-surface-raised p-1", className)}>
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-surface shadow-sm transition-transform duration-300 ease-[var(--ease-out-soft)]"
        style={{ transform: `translateX(${Math.max(0, idx) * 100}%)` }}
      />
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={`${label} theme`}
          title={label}
          onClick={() => setTheme(value)}
          className={cn("relative z-10 flex w-9 items-center justify-center rounded-full transition-colors cursor-pointer", theme === value ? "text-primary" : "text-muted hover:text-text")}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
