import { cn } from "@/lib/cn";

/** Night-sky illustration: floating receipt, coins and stars on an orbit. */
export function NightIllustration({ slide = 2 }: { slide?: number }) {
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

