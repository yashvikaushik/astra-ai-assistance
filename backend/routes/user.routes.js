import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getCurrentUser,
    updateAssistant,
    askAstra,
    getChatHistory,
    getSessionMessages,
    deleteSession,
    clearAllSessions,
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

// Conversation History & Session Management
userRouter.get("/history", protectRoute, getChatHistory);
userRouter.get("/history/:sessionId", protectRoute, getSessionMessages);
userRouter.delete("/history/:sessionId", protectRoute, deleteSession);
userRouter.delete("/history", protectRoute, clearAllSessions);

export default userRouter;
