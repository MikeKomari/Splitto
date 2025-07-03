import { Router } from "express";
import { RequestSplitBill } from "../controllers";

const route = Router();

route.post("/split", RequestSplitBill);

export default route;
