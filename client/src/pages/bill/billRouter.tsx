import BillEditor from "../main/BillEditor";
import PersonAssignment from "../main/PersonAssignment";
import SummaryScreen from "../main/SummaryScreen";

export default [
  {
    path: "edit/:billId",
    element: <BillEditor />,
  },
  {
    path: "assign/:billId",
    element: <PersonAssignment />,
  },
  {
    path: "summary/:billId",
    element: <SummaryScreen />,
  },
];
