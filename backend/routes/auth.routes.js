import express from "express";
import { login, signup, logout, getMe } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const authRouter = express.Router();
console.log("in the authorization routes");
authRouter.post("/signup", signup);
authRouter.post("/signin", login);
authRouter.get("/logout", logout);
authRouter.get("/me", protectRoute, getMe);

export default authRouter;
