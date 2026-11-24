import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlowHeader, StickyCta } from "@/components/layout/FlowHeader";
import { Button } from "@/components/ui/Button";
import { SplitSummary } from "@/features/summary/SplitSummary";
import { useDraft } from "@/store/draftStore";
import { useHistory } from "@/store/historyStore";
import { useDraftGuard } from "./useDraftGuard";

export default function Summary() {
  const draft = useDraftGuard();
  const clear = useDraft((s) => s.clear);
  const saveBill = useHistory((s) => s.saveBill);
  const navigate = useNavigate();

  // Saved as soon as the split is shown (upsert by id, so revisits are safe).
  useEffect(() => {
    if (draft) saveBill(draft);
  }, [draft, saveBill]);

  if (!draft) return null;
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-32">
      <FlowHeader step={2} title="The split" back="/bill/people" />
      <div className="animate-page-in">
        <SplitSummary bill={draft} celebrate />
      </div>
      <StickyCta>
        <Button
          variant="dark"
          size="lg"
          block
          onClick={() => {
            navigate("/app", { replace: true });
            clear();
          }}
        >
          Done
        </Button>
      </StickyCta>
    </div>
  );
}
