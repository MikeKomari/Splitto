import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { usePrefs } from "@/store/historyStore";
import { cn } from "@/lib/cn";

const slides = [
  { title: "Save your time\nand money", body: "Snap the receipt, tap who had what. Splitto does the maths, tax and service included." },
  { title: "Reads receipts\non your phone", body: "Scanning happens on this device. Free, private, and it works offline after the first scan." },
  { title: "Fair to the\nlast rupiah", body: "Everyone's share adds up exactly to the bill. No awkward Rp 1 left over." },
];

/** Night-sky illustration: floating receipt, coins and stars on an orbit. */
function Illustration({ slide }: { slide: number }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-night">
      {/* Orbit rings */}
      <svg className="animate-orbit absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-60" viewBox="0 0 400 400" aria-hidden>
        <ellipse cx="200" cy="200" rx="170" ry="120" fill="none" stroke="#A283E6" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="2 7" />
        <ellipse cx="200" cy="200" rx="120" ry="80" fill="none" stroke="#C3B0F0" strokeOpacity=".25" strokeWidth="1" />
      </svg>
      {/* Stars */}
      {[
        [12, 18, 3], [82, 12, 2], [70, 70, 2.5], [20, 78, 2], [50, 8, 1.5], [90, 45, 2], [8, 48, 1.5], [60, 88, 1.5],
      ].map(([x, y, s], i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-star-silver"
          style={{ left: `${x}%`, top: `${y}%`, width: s * 2, height: s * 2, animationDelay: `${i * 0.35}s` }}
        />
      ))}
      {/* The one gold star */}
      <svg className="animate-twinkle absolute right-[18%] top-[16%] h-7 w-7" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z" fill="#FFC857" />
      </svg>

      {/* Receipt card */}
      <div
        className="animate-float absolute left-1/2 top-1/2 w-[46%] max-w-[190px] -translate-x-1/2 -translate-y-1/2"
        style={{ ["--r" as string]: "-6deg" }}
      >
        <div className="rounded-[14px] bg-star-white p-4 shadow-[0_20px_40px_rgba(0,0,0,.35)]">
          <div className="mb-3 h-2.5 w-16 rounded bg-[#DDD2F7]" />
          {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
            <div key={i} className="mb-2 flex items-center justify-between gap-2">
              <span className="h-2 rounded bg-[#E0DDE8]" style={{ width: `${w * 60}%` }} />
              <span className={cn("h-2 w-8 rounded transition-colors duration-500", slide >= 1 && i < 3 ? "bg-[#A283E6]" : "bg-[#C7C3D3]")} />
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#C7C3D3] pt-2">
            <span className="h-2.5 w-10 rounded bg-[#1F1A2B]" />
            <span className="h-2.5 w-12 rounded bg-[#6A3BC6]" />
          </div>
        </div>
      </div>

      {/* Split chips */}
      {[
        { x: "14%", y: "30%", c: "#EDE7FB", d: "0s", t: "Rp 48k" },
        { x: "64%", y: "64%", c: "#DDF5F1", d: "1.2s", t: "Rp 52k" },
        { x: "18%", y: "66%", c: "#FCE7F1", d: "2.1s", t: "Rp 31k" },
      ].map((chip, i) => (
        <span
          key={i}
          className={cn("animate-float absolute rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#1F1A2B] shadow-lg transition-all duration-500", slide === 0 && i > 0 && "scale-75 opacity-0")}
          style={{ left: chip.x, top: chip.y, background: chip.c, animationDelay: chip.d }}
        >
          {chip.t}
        </span>
      ))}
    </div>
  );
}

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
          <Illustration slide={slide} />
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
