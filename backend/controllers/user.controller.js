import mongoose from "mongoose";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Get current user error:", error.message);
        return res.status(500).json({ message: "Get current user error" });
    }
};

export const updateAssistant = async (req, res) => {
    try {
        const userId = req.userId;
        const { assistantName, assistantGender } = req.body;
        let assistantImage = req.body.assistantImage;

        // If an image was uploaded through Multer
        if (req.file) {
            const uploadedUrl = await uploadOnCloudinary(req.file.path);
            if (uploadedUrl) {
                assistantImage = uploadedUrl;
            }
        }

        const updateData = {};
        if (assistantName) updateData.assistantName = assistantName;
        if (assistantImage) updateData.assistantImage = assistantImage;
        if (assistantGender) {
            updateData.assistantGender = assistantGender;
        } else if (assistantName) {
            updateData.assistantGender = assistantName.toLowerCase() === "orion" ? "male" : "female";
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Assistant updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update assistant error:", error.message);
        return res.status(500).json({ message: "Update assistant error" });
    }
};

export const askAstra = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                content: null,
                error: "User not found",
            });
        }

        const userName = user.name || "Explorer";
        const assistantName = user.assistantName || "Astra Nova";
        const command = req.body.command || req.body.prompt;
        const reqSessionId = req.body.sessionId;

        if (!command || !command.trim()) {
            return res.status(400).json({
                success: false,
                content: null,
                error: "Command is required",
            });
        }

        // Ensure user.history is an array and filter out any malformed legacy items
        if (!Array.isArray(user.history)) {
            user.history = [];
        } else {
            user.history = user.history.filter((s) => s && typeof s === "object" && s.sessionId);
        }

        // Find existing session or create a new one
        let session;
        if (reqSessionId) {
            session = user.history.find((s) => s.sessionId === reqSessionId);
        }

        if (!session) {
            const trimmed = command.trim();
            const cleanTitle = trimmed.length > 32 ? trimmed.slice(0, 32) + "..." : trimmed;
            session = {
                sessionId: new mongoose.Types.ObjectId().toString(),
                title: cleanTitle,
                startedAt: new Date(),
                messages: [],
            };
            user.history.unshift(session); // Most recent session on top
        }

        // Retrieve recent conversation history from the active session for multi-turn context
        const recentHistory = (session.messages || []).slice(-8);

        const result = await geminiResponse(command, assistantName, userName, recentHistory);

        // Extract JSON from potential markdown formatting or conversational wrappings
        const cleanJson = (result || "").replace(/```json/gi, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            const fallbackReply = cleanJson || "I stand ready.";

            session.messages.push({
                role: "user",
                content: command.trim(),
                type: "general",
                timestamp: new Date(),
            });

            session.messages.push({
                role: "assistant",
                content: fallbackReply,
                type: "general",
                urls: [],
                timestamp: new Date(),
            });

            await user.save();

            return res.status(200).json({
                success: true,
                sessionId: session.sessionId,
                type: "general",
                userinput: command,
                content: fallbackReply,
                response: fallbackReply,
                actions: [{ type: "general", userinput: command, content: fallbackReply }],
                urls: [],
                url: null,
                error: null,
            });
        }

        let gemResult;
        try {
            gemResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.warn("JSON parse fallback in askAstra:", parseError.message);
            const fallbackReply = cleanJson || "Transmission processed.";

            session.messages.push({
                role: "user",
                content: command.trim(),
                type: "general",
                timestamp: new Date(),
            });

            session.messages.push({
                role: "assistant",
                content: fallbackReply,
                type: "general",
                urls: [],
                timestamp: new Date(),
            });

            await user.save();

            return res.status(200).json({
                success: true,
                sessionId: session.sessionId,
                type: "general",
                userinput: command,
                content: fallbackReply,
                response: fallbackReply,
                actions: [{ type: "general", userinput: command, content: fallbackReply }],
                urls: [],
                url: null,
                error: null,
            });
        }

        // Normalize single vs multi-intent structure
        let rawActions = [];
        if (Array.isArray(gemResult.actions) && gemResult.actions.length > 0) {
            rawActions = gemResult.actions;
        } else if (gemResult.type) {
            rawActions = [{ type: gemResult.type, userinput: gemResult.userinput || command }];
        } else {
            rawActions = [{ type: "general", userinput: command }];
        }

        const executedActions = [];
        const urls = [];
        const voiceFragments = [];

        for (const act of rawActions) {
            const type = act.type || "general";
            const userinput = act.userinput || command;

            switch (type) {
                case "get_date":
                case "get-date": {
                    const dateStr = moment().format("MMM D, YYYY");
                    const fullDateStr = moment().format("dddd, MMMM Do, YYYY");
                    executedActions.push({
                        type: "get_date",
                        userinput,
                        content: dateStr,
                        response: `Today's date is ${fullDateStr}`,
                    });
                    voiceFragments.push(`Today's date is ${fullDateStr}.`);
                    break;
                }

                case "get_time":
                case "get-time": {
                    const timeStr = moment().format("hh:mm A");
                    executedActions.push({
                        type: "get_time",
                        userinput,
                        content: timeStr,
                        response: `The current time is ${timeStr}`,
                    });
                    voiceFragments.push(`The time is ${timeStr}.`);
                    break;
                }

                case "get_day":
                case "get-day": {
                    const dayStr = moment().format("dddd");
                    executedActions.push({
                        type: "get_day",
                        userinput,
                        content: dayStr,
                        response: `Today is ${dayStr}`,
                    });
                    voiceFragments.push(`Today is ${dayStr}.`);
                    break;
                }

                case "get_month":
                case "get-month": {
                    const monthStr = moment().format("MMMM");
                    executedActions.push({
                        type: "get_month",
                        userinput,
                        content: monthStr,
                        response: `The current month is ${monthStr}`,
                    });
                    voiceFragments.push(`The current month is ${monthStr}.`);
                    break;
                }

                case "get_year":
                case "get-year": {
                    const yearStr = moment().format("YYYY");
                    executedActions.push({
                        type: "get_year",
                        userinput,
                        content: yearStr,
                        response: `The current year is ${yearStr}`,
                    });
                    voiceFragments.push(`The year is ${yearStr}.`);
                    break;
                }

                case "google_search":
                case "google-search": {
                    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(userinput)}`;
                    urls.push(targetUrl);
                    executedActions.push({
                        type: "google_search",
                        userinput,
                        content: userinput,
                        response: `Searching Google for ${userinput}`,
                        url: targetUrl,
                    });
                    voiceFragments.push(`Searching Google for ${userinput}.`);
                    break;
                }

                case "youtube_search":
                case "youtube-search": {
                    const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(userinput)}`;
                    urls.push(targetUrl);
                    executedActions.push({
                        type: "youtube_search",
                        userinput,
                        content: userinput,
                        response: `Searching YouTube for ${userinput}`,
                        url: targetUrl,
                    });
                    voiceFragments.push(`Searching YouTube for ${userinput}.`);
                    break;
                }

                case "youtube_play":
                case "youtube-play": {
                    const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(userinput)}`;
                    urls.push(targetUrl);
                    executedActions.push({
                        type: "youtube_play",
                        userinput,
                        content: userinput,
                        response: `Playing ${userinput} on YouTube`,
                        url: targetUrl,
                    });
                    voiceFragments.push(`Playing ${userinput} on YouTube.`);
                    break;
                }

                case "calculator_open": {
                    executedActions.push({
                        type: "calculator_open",
                        userinput,
                        content: "calculator",
                        response: "Opening calculator",
                    });
                    voiceFragments.push("Opening calculator.");
                    break;
                }

                case "instagram_open": {
                    const targetUrl = "https://www.instagram.com";
                    urls.push(targetUrl);
                    executedActions.push({
                        type: "instagram_open",
                        userinput,
                        content: "instagram",
                        response: "Opening Instagram",
                        url: targetUrl,
                    });
                    voiceFragments.push("Opening Instagram.");
                    break;
                }

                case "facebook_open": {
                    const targetUrl = "https://www.facebook.com";
                    urls.push(targetUrl);
                    executedActions.push({
                        type: "facebook_open",
                        userinput,
                        content: "facebook",
                        response: "Opening Facebook",
                        url: targetUrl,
                    });
                    voiceFragments.push("Opening Facebook.");
                    break;
                }

                case "weather_show":
                case "weather-show": {
                    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent("weather " + (userinput || ""))}`;
                    urls.push(targetUrl);
                    executedActions.push({
                        type: "weather-show",
                        userinput,
                        content: userinput,
                        response: `Checking the weather for ${userinput || "your area"}`,
                        url: targetUrl,
                    });
                    voiceFragments.push(`Checking the weather for ${userinput || "your area"}.`);
                    break;
                }

                case "general":
                default: {
                    const generalReply =
                        gemResult.response ||
                        gemResult.content ||
                        userinput ||
                        "I stand ready.";
                    executedActions.push({
                        type: "general",
                        userinput,
                        content: generalReply,
                        response: generalReply,
                    });
                    voiceFragments.push(generalReply);
                    break;
                }
            }
        }

        // Determine final spoken response
        let finalResponse = voiceFragments.join(" ");
        if (
            gemResult.response &&
            rawActions.length === 1 &&
            !["get_time", "get_date", "get_day", "get_month", "get_year"].includes(rawActions[0].type)
        ) {
            finalResponse = gemResult.response;
        }

        // Record both user prompt and assistant reply in the active session
        session.messages.push({
            role: "user",
            content: command.trim(),
            type: "general",
            timestamp: new Date(),
        });

        session.messages.push({
            role: "assistant",
            content: finalResponse,
            type: executedActions.length === 1 ? executedActions[0].type : "multi_action",
            urls,
            timestamp: new Date(),
        });

        await user.save();

        return res.status(200).json({
            success: true,
            sessionId: session.sessionId,
            type: executedActions.length === 1 ? executedActions[0].type : "multi_action",
            userinput: command,
            content: executedActions.map((a) => a.content || a.response).join(" | "),
            response: finalResponse || "Transmission processed.",
            actions: executedActions,
            urls,
            url: urls[0] || null,
            error: null,
        });
    } catch (error) {
        console.error("Ask Astra error:", error);
        return res.status(500).json({
            success: false,
            content: null,
            error: error.message || "Failed to process transmission",
        });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const validHistory = Array.isArray(user.history)
            ? user.history.filter((s) => s && typeof s === "object" && s.sessionId)
            : [];

        const sessions = validHistory.map((session) => ({
            sessionId: session.sessionId,
            title: session.title || "Transmission",
            startedAt: session.startedAt,
            messageCount: session.messages?.length || 0,
            lastMessage: session.messages?.[session.messages.length - 1]?.content || "",
        }));

        return res.status(200).json({
            success: true,
            sessions,
        });
    } catch (error) {
        console.error("Get chat history error:", error.message);
        return res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

export const getSessionMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const session = (user.history || []).find((s) => s.sessionId === sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        return res.status(200).json({
            success: true,
            session: {
                sessionId: session.sessionId,
                title: session.title,
                startedAt: session.startedAt,
                messages: session.messages,
            },
        });
    } catch (error) {
        console.error("Get session messages error:", error.message);
        return res.status(500).json({ message: "Failed to fetch session messages" });
    }
};

export const deleteSession = async (req, res) => {
    try {
        const userId = req.userId;
        const { sessionId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.history = (Array.isArray(user.history) ? user.history : []).filter(
            (s) => s && typeof s === "object" && s.sessionId !== sessionId
        );
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Session deleted successfully",
            sessionId,
        });
    } catch (error) {
        console.error("Delete session error:", error.message);
        return res.status(500).json({ message: "Failed to delete session" });
    }
};

export const clearAllSessions = async (req, res) => {
    try {
        const userId = req.userId;
        await User.findByIdAndUpdate(userId, { history: [] });
        return res.status(200).json({
            success: true,
            message: "All conversation history cleared",
        });
    } catch (error) {
        console.error("Clear all sessions error:", error.message);
        return res.status(500).json({ message: "Failed to clear history" });
    }
};
