/**
 * Installed PWA, or a phone/tablet: these people want the app, not a
 * marketing page. Evaluated once, synchronously, so there's no flash.
 */
export function prefersApp() {
  if (typeof window === "undefined") return false;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const touchPhone = window.matchMedia?.("(pointer: coarse)").matches && window.matchMedia?.("(max-width: 820px)").matches;
  return standalone || !!touchPhone;
}
