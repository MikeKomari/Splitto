import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { usePrefs } from "@/store/historyStore";
import { cn } from "@/lib/cn";
import { NightIllustration } from "@/components/brand/NightIllustration";

const slides = [
  { title: "Save your time\nand money", body: "Snap the receipt, tap who had what. Splitto does the maths, tax and service included." },
  { title: "Reads receipts\non your phone", body: "Scanning happens on this device. Free, private, and it works offline after the first scan." },
  { title: "Fair to the\nlast rupiah", body: "Everyone's share adds up exactly to the bill. No awkward Rp 1 left over." },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { onboarded, setOnboarded } = usePrefs();
  const [slide, setSlide] = useState(0);
  if (onboarded) return <Navigate to="/app" replace />;

  const finish = () => {
    setOnboarded();
    navigate("/app", { replace: true });
  };
  const s = slides[slide];

  return (
    <div className="flex min-h-dvh flex-col bg-surface sm:items-center sm:justify-center sm:bg-bg sm:p-6">
      <div className="flex min-h-dvh w-full flex-col sm:min-h-0 sm:max-w-sm sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-border sm:bg-surface">
        <div className="relative h-[56dvh] overflow-hidden rounded-b-[28px] sm:h-[420px] sm:rounded-none">
          <NightIllustration slide={slide} />
          <button onClick={finish} className="safe-top absolute right-4 top-2 rounded-full px-3 py-1 text-[13px] font-semibold text-star-white/80 hover:text-star-white cursor-pointer">
            Skip
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center px-8 pb-8 pt-8 text-center">
          <h1 key={`t${slide}`} className="animate-page-in whitespace-pre-line text-[28px] leading-[34px]">
            {s.title}
          </h1>
          <p key={`b${slide}`} className="animate-page-in mt-3 max-w-[300px] text-[14px] leading-[22px] text-muted" style={{ animationDelay: "60ms" }}>
            {s.body}
          </p>
          <div className="mt-6 flex gap-1.5" role="tablist" aria-label="Intro slides">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === slide}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={cn("h-1.5 rounded-full transition-all duration-300 cursor-pointer", i === slide ? "w-6 bg-primary" : "w-1.5 bg-border")}
              />
            ))}
          </div>
          <div className="mt-auto w-full pt-8">
            <Button variant="dark" size="lg" block onClick={() => (slide < slides.length - 1 ? setSlide(slide + 1) : finish())}>
              {slide < slides.length - 1 ? "Next" : "Get started"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
