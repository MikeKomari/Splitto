import { Link, Navigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Github, Lock, ScanLine, Users, WifiOff } from "lucide-react";
import { NightIllustration } from "@/components/brand/NightIllustration";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { prefersApp } from "@/lib/device";

const REPO = "https://github.com/MikeKomari/Splitto";
const AUTHORS = [
  { name: "MikeKomari", url: "https://github.com/MikeKomari" },
  { name: "Nocturnalnerds", url: "https://github.com/Nocturnalnerds" },
];

const steps = [
  { icon: ScanLine, title: "Scan the receipt", body: "Point your camera at the bill. Items, prices, service and PB1 are read for you." },
  { icon: Users, title: "Tap who had what", body: "Pick a friend, tap their dishes. Shared plates split evenly between whoever tapped them." },
  { icon: CheckCircle2, title: "Share the split", body: "Everyone sees exactly what they owe, tax and service included, to the last rupiah." },
];

const points = [
  { icon: Lock, title: "Free, private scanning", body: "Receipts are read on your phone. No photo is uploaded unless you turn on AI scanning." },
  { icon: CheckCircle2, title: "Totals that add up", body: "Each person's share sums exactly to the bill, and Splitto warns you when a scan doesn't match the receipt." },
  { icon: WifiOff, title: "No sign-up, works offline", body: "Install it to your home screen. Your bills and friends stay on your device." },
];

function LaunchButton({ size = "md" as "md" | "lg" }) {
  return (
    <Link to="/app">
      <Button size={size}>
        Launch app <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}

export default function Landing() {
  if (prefersApp()) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="font-display text-[20px] font-semibold tracking-tight">
            Splitto
          </Link>
          <nav className="flex items-center gap-2 sm:gap-5">
            <a href="#how" className="hidden text-[14px] font-medium text-muted hover:text-text sm:inline">
              How it works
            </a>
            <a href={REPO} target="_blank" rel="noreferrer" className="hidden text-[14px] font-medium text-muted hover:text-text sm:inline">
              GitHub
            </a>
            <ThemeToggle className="hidden sm:inline-grid" />
            <LaunchButton />
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div className="animate-page-in">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-primary">Bill splitting for group dinners</p>
            <h1 className="mt-3 text-[40px] leading-[46px] tracking-[-0.02em] [text-wrap:balance] md:text-[52px] md:leading-[58px]">
              Snap the receipt. Know who owes what.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-[26px] text-muted">
              Splitto reads the bill, lets everyone tap what they ate, and works out each share with service and PB1 included. No more
              calculator passed around the table.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LaunchButton size="lg" />
              <a href="#how" className="px-2 text-[15px] font-semibold text-primary hover:underline">
                See how it works
              </a>
            </div>
          </div>

          <div className="animate-rise-in mx-auto w-full max-w-[340px]" style={{ ["--i" as string]: 2 }}>
            <div className="overflow-hidden rounded-[36px] border-[10px] border-night bg-night shadow-pop">
              <div className="h-[300px]">
                <NightIllustration />
              </div>
              <div className="space-y-2 bg-surface p-4">
                {[
                  ["Nathan", "Rp 88.935", 64],
                  ["Michele", "Rp 52.310", 65],
                  ["Jugram", "Rp 92.065", 8],
                ].map(([name, amount, avatar]) => (
                  <div key={name as string} className="flex items-center gap-3 rounded-[12px] border border-border p-2">
                    <img src={`${import.meta.env.BASE_URL}profile/profile1/${avatar}.png`} alt="" className="h-9 w-9 rounded-[10px] bg-[var(--tile-1)]" />
                    <span className="flex-1 text-[14px] font-semibold">{name}</span>
                    <span className="text-[14px] font-semibold tabular">{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-[28px] leading-9">How it works</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-[20px] border border-border bg-bg p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-subtle text-primary-subtle-text">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-[17px] leading-6">{s.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[22px] text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {points.map((p) => (
              <div key={p.title}>
                <p.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-[17px] leading-6">{p.title}</h3>
                <p className="mt-1.5 text-[14px] leading-[22px] text-muted">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-[24px] bg-night p-6 text-star-white sm:flex-row sm:items-center sm:p-8 dark:border dark:border-border">
            <div>
              <h2 className="text-[22px] leading-7">Next dinner, let Splitto do the maths.</h2>
              <p className="mt-1 text-[14px] text-star-silver">Free to use. Install it from your browser for one-tap access.</p>
            </div>
            <Link
              to="/app"
              className="pressable inline-flex h-14 items-center gap-2 rounded-lg bg-star-white px-6 text-[16px] font-semibold text-night hover:opacity-90"
            >
              Launch app <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Built by{" "}
            {AUTHORS.map((a, i) => (
              <span key={a.name}>
                {i > 0 && " and "}
                <a href={a.url} target="_blank" rel="noreferrer" className="font-semibold text-text hover:text-primary">
                  {a.name}
                </a>
              </span>
            ))}
            . A Nanashi project.
          </p>
          <a href={REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-text hover:text-primary">
            <Github className="h-4 w-4" /> MikeKomari/Splitto
          </a>
        </div>
      </footer>
    </div>
  );
}
