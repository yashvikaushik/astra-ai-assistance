import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCurrentUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/currentuser", protectRoute, getCurrentUser);

export default userRouter;
