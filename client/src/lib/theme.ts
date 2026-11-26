import { useEffect } from "react";
import { usePrefs, type ThemePref } from "@/store/historyStore";

const THEME_COLOR = { light: "#FBFAFD", dark: "#0F0D14" } as const;

export function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(pref: ThemePref) {
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", THEME_COLOR[resolved]));
}

/** Keeps <html data-theme> in sync with the saved choice (and the phone, in "system"). */
export function useThemeSync() {
  const pref = usePrefs((s) => s.theme);
  useEffect(() => {
    apply(pref);
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);
}
