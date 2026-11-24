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
  if (!bill) return <NotFound />;
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-12">
      <header className="safe-top flex items-center justify-between pb-3">
        <IconButton label="Back" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <h1 className="text-[17px] leading-6">Bill</h1>
        <IconButton
          label="Delete bill"
          className="-mr-2 text-muted hover:text-danger"
          onClick={() => {
            if (!confirm("Delete this bill from your history?")) return;
            removeBill(bill.id);
            toast("Bill deleted");
            navigate("/app/activity", { replace: true });
          }}
        >
          <Trash2 className="h-5 w-5" />
        </IconButton>
      </header>
      <div className="animate-page-in">
        <SplitSummary bill={bill} />
      </div>
    </div>
  );
}
