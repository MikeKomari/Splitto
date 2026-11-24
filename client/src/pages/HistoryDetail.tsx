import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { IconButton } from "@/components/ui/Button";
import { SplitSummary } from "@/features/summary/SplitSummary";
import { useHistory } from "@/store/historyStore";
import NotFound from "./NotFound";

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bill = useHistory((s) => s.bills.find((b) => b.id === id));
  const removeBill = useHistory((s) => s.removeBill);
  const [arming, setArming] = useState(false);
  useEffect(() => {
    if (!arming) return;
    const t = setTimeout(() => setArming(false), 3000);
    return () => clearTimeout(t);
  }, [arming]);
  if (!bill) return <NotFound />;
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-12">
      <header className="safe-top flex items-center justify-between pb-3">
        <IconButton label="Back" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <h1 className="text-[17px] leading-6">Bill</h1>
        {arming ? (
          <button
            onClick={() => {
              removeBill(bill.id);
              toast("Bill deleted");
              navigate("/app/activity", { replace: true });
            }}
            className="animate-pop-in -mr-1 h-9 rounded-full bg-danger px-3 text-[13px] font-semibold text-white cursor-pointer"
          >
            Tap to delete
          </button>
        ) : (
          <IconButton label="Delete bill" className="-mr-2 text-muted hover:text-danger" onClick={() => setArming(true)}>
            <Trash2 className="h-5 w-5" />
          </IconButton>
        )}
      </header>
      <div className="animate-page-in">
        <SplitSummary bill={bill} />
      </div>
    </div>
  );
}
