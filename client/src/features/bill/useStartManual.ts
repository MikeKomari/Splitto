import { useNavigate } from "react-router-dom";
import { newBill, useDraft } from "@/store/draftStore";

export function useStartManual() {
  const navigate = useNavigate();
  const start = useDraft((s) => s.start);
  return () => {
    const bill = newBill({ source: "manual" });
    start(bill);
    const id = useDraft.getState().addItem();
    navigate("/bill/items", { state: { focusItem: id } });
  };
}
