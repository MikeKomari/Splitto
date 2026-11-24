import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDraft } from "@/store/draftStore";

/** Bill flow screens need a draft; deep links without one go home. */
export function useDraftGuard() {
  const draft = useDraft((s) => s.draft);
  const navigate = useNavigate();
  useEffect(() => {
    if (!draft) navigate("/app", { replace: true });
  }, [draft, navigate]);
  return draft;
}
