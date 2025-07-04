import { Router } from "express";
import { Login, Register } from "../controllers/AuthController";

const authRouter = Router();

authRouter.post("/login", Login)
authRouter.post("/regist", Register)

export {authRouter};

