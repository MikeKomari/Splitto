import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, ReceiptText, ScanLine } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { NanashiMark } from "@/components/layout/NanashiMark";
import { useDraft } from "@/store/draftStore";
import { useHistory, usePrefs } from "@/store/historyStore";
import { computeSplit } from "@/features/bill/split";
import { formatRupiah } from "@/lib/money";
import { formatDate } from "@/lib/date";
import { useStartManual } from "@/features/bill/useStartManual";
import { cn } from "@/lib/cn";

const cardTints = ["bg-primary-subtle", "bg-gold-100", "bg-[var(--tile-3)]", "bg-[var(--tile-4)]"];

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Good morning" : h < 15 ? "Good afternoon" : h < 19 ? "Good evening" : "Good night";
}

export default function Home() {
  const navigate = useNavigate();
  const draft = useDraft((s) => s.draft);
  const bills = useHistory((s) => s.bills);
  const friends = useHistory((s) => s.friends);
  const startManual = useStartManual();
  const onboarded = usePrefs((s) => s.onboarded);
  const draftTotal = draft ? computeSplit(draft).grandTotal : 0;

  if (!onboarded) return <Navigate to="/welcome" replace />;

  return (
    <>
      <header className="safe-top flex items-center justify-between pt-4 pb-5">
        <div>
          <p className="text-[13px] text-muted">{greeting()}</p>
          <h1 className="text-[28px] leading-9">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Avatar avatar={friends[0]?.avatar ?? 64} size="sm" />
        </div>
      </header>

      {/* Bill carousel: "Scan bill" pill + in-progress + recent bills */}
      <section aria-label="Bills" className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        <button
          onClick={() => navigate("/scan")}
          className="pressable animate-rise-in group relative flex h-[176px] w-[68px] shrink-0 snap-start flex-col items-center justify-between rounded-[20px] bg-primary py-4 text-on-primary cursor-pointer"
          aria-label="Scan a new bill"
        >
          <ScanLine className="h-5 w-5" />
          <span className="whitespace-nowrap text-[15px] font-semibold [writing-mode:vertical-rl] rotate-180">Scan bill</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-on-primary/40 transition-transform duration-300 group-hover:rotate-90">
            <Plus className="h-4 w-4" />
          </span>
        </button>

        {draft && (
          <Link
            to={draft.people.length ? "/bill/people" : "/bill/items"}
            className="pressable animate-rise-in relative flex h-[176px] w-[156px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[20px] border-2 border-dashed border-primary/50 bg-surface p-4"
            style={{ ["--i" as string]: 1 }}
          >
            <span className="w-fit rounded-full bg-star px-2 py-0.5 text-[11px] font-bold text-on-star">In progress</span>
            <div>
              <p className="text-[12px] text-muted">Total bill</p>
              <p className="font-display text-[18px] font-semibold tabular">{formatRupiah(draftTotal)}</p>
              <p className="mt-2 text-[12px] text-muted">{draft.title || "Untitled bill"}</p>
              <p className="text-[13px] font-semibold text-primary">Continue →</p>
            </div>
          </Link>
        )}

        {bills.slice(0, 6).map((b, i) => (
          <Link
            key={b.id}
            to={`/history/${b.id}`}
            className={cn(
              "pressable animate-rise-in relative flex h-[176px] w-[156px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[20px] p-4",
              cardTints[i % cardTints.length]
            )}
            style={{ ["--i" as string]: i + 2 }}
          >
            <span aria-hidden className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-surface/40" />
            <span aria-hidden className="absolute right-6 bottom-10 h-8 w-8 rounded-full bg-surface/50" />
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface/80">
              <ReceiptText className="h-4 w-4 text-primary" />
            </span>
            <div className="relative">
              <p className="text-[12px] text-muted">Total bill</p>
              <p className="font-display text-[18px] font-semibold tabular">{formatRupiah(b.grandTotal)}</p>
              <p className="mt-2 text-[12px] text-muted">Split to</p>
              <p className="font-display text-[18px] font-semibold">{b.people.length}</p>
            </div>
          </Link>
        ))}

        {!draft && bills.length === 0 && (
          <div className="animate-rise-in flex h-[176px] w-[220px] shrink-0 flex-col justify-center rounded-[20px] border border-border bg-surface p-4" style={{ ["--i" as string]: 1 }}>
            <p className="font-semibold">No bills yet</p>
            <p className="mt-1 text-[13px] text-muted">Scan your first receipt. Your splits show up here.</p>
          </div>
        )}
      </section>

      {/* Recent friends */}
      <section className="mt-7 rounded-[24px] border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] leading-6">Recent friends</h2>
          <Link to="/app/friends" className="text-[13px] font-semibold text-primary">
            See all
          </Link>
        </div>
        {friends.length === 0 ? (
          <p className="mt-3 text-[13px] text-muted">People you split with will appear here, ready to add with one tap.</p>
        ) : (
          <ul className="no-scrollbar -mx-5 mt-4 flex gap-4 overflow-x-auto px-5">
            {friends.slice(0, 10).map((f, i) => (
              <li key={f.id} className="animate-rise-in flex w-16 shrink-0 flex-col items-center gap-1.5" style={{ ["--i" as string]: i }}>
                <Avatar avatar={f.avatar} name={f.name} size="lg" />
                <span className="w-full truncate text-center text-[12px] font-medium">{f.name}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <div>
            <h2 className="text-[17px] leading-6">No receipt?</h2>
            <p className="text-[13px] text-muted">Type the items in yourself.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={startManual} aria-label="Enter a bill by hand" className="h-11 w-11 rounded-full p-0">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {bills.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-[17px] leading-6">Latest</h2>
          <ul className="space-y-2">
            {bills.slice(0, 3).map((b, i) => (
              <li key={b.id} className="animate-rise-in" style={{ ["--i" as string]: i }}>
                <Link to={`/history/${b.id}`} className="pressable flex items-center gap-3 rounded-[16px] bg-surface p-3 border border-border">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary-subtle">
                    <ReceiptText className="h-5 w-5 text-primary-subtle-text" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{b.title || "Untitled bill"}</span>
                    <span className="text-[12px] text-muted">
                      {formatDate(b.date)} · {b.people.length} people
                    </span>
                  </span>
                  <span className="font-semibold tabular">{formatRupiah(b.grandTotal)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <NanashiMark />
    </>
  );
}
