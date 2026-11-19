import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getCurrentUser,
    updateAssistant,
    askAstra,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const userRouter = express.Router();

userRouter.get("/currentuser", protectRoute, getCurrentUser);
userRouter.post(
    "/update-assistant",
    protectRoute,
    upload.single("assistantImage"),
    updateAssistant
);
userRouter.post("/ask-astra", protectRoute, askAstra);
userRouter.post("/ask", protectRoute, askAstra);

export default userRouter;
