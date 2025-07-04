import { Router } from "express";
import { RequestSplitBill } from "../controllers";
import { SaveSplitBill } from "../controllers/RequestController";

const route = Router();

route.post("/split", RequestSplitBill);
route.post("/postBill", SaveSplitBill);

export default route;
