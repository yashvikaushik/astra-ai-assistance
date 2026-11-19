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
        const { assistantName } = req.body;
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

        if (!command || !command.trim()) {
            return res.status(400).json({
                success: false,
                content: null,
                error: "Command is required",
            });
        }

        user.history.push(command.trim());
        await user.save();

        const result = await geminiResponse(command, assistantName, userName);
        const cleanJson = (result || "").replace(/```json/gi, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            // If the model gave a raw text answer instead of JSON, return it as a general response
            return res.status(200).json({
                success: true,
                type: "general",
                userinput: command,
                content: cleanJson || "I am standing by.",
                response: cleanJson || "I am standing by.",
                error: null,
            });
        }

        let gemResult;
        try {
            gemResult = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.warn("JSON parse fallback in askAstra:", parseError.message);
            return res.status(200).json({
                success: true,
                type: "general",
                userinput: command,
                content: cleanJson,
                response: cleanJson,
                error: null,
            });
        }

        const type = gemResult.type || "general";
        const userinput = gemResult.userinput || command;
        const spokenResponse = gemResult.response || "";

        switch (type) {
            case "get_date":
            case "get-date":
                return res.status(200).json({
                    success: true,
                    type: "get_date",
                    userinput,
                    content: moment().format("MMM D, YYYY"),
                    response: spokenResponse || `Today's date is ${moment().format("MMMM Do, YYYY")}`,
                    error: null,
                });

            case "get_time":
            case "get-time":
                return res.status(200).json({
                    success: true,
                    type: "get_time",
                    userinput,
                    content: moment().format("hh:mm A"),
                    response: spokenResponse || `The current time is ${moment().format("hh:mm A")}`,
                    error: null,
                });

            case "get_day":
            case "get-day":
                return res.status(200).json({
                    success: true,
                    type: "get_day",
                    userinput,
                    content: moment().format("dddd"),
                    response: spokenResponse || `Today is ${moment().format("dddd")}`,
                    error: null,
                });

            case "get_month":
            case "get-month":
                return res.status(200).json({
                    success: true,
                    type: "get_month",
                    userinput,
                    content: moment().format("MMMM"),
                    response: spokenResponse || `The current month is ${moment().format("MMMM")}`,
                    error: null,
                });

            case "get_year":
            case "get-year":
                return res.status(200).json({
                    success: true,
                    type: "get_year",
                    userinput,
                    content: moment().format("YYYY"),
                    response: spokenResponse || `The current year is ${moment().format("YYYY")}`,
                    error: null,
                });

            case "google_search":
            case "google-search":
                return res.status(200).json({
                    success: true,
                    type: "google_search",
                    userinput,
                    content: userinput,
                    response: spokenResponse || `Searching Google for ${userinput}`,
                    url: `https://www.google.com/search?q=${encodeURIComponent(userinput)}`,
                    error: null,
                });

            case "youtube_search":
            case "youtube-search":
                return res.status(200).json({
                    success: true,
                    type: "youtube_search",
                    userinput,
                    content: userinput,
                    response: spokenResponse || `Searching YouTube for ${userinput}`,
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(userinput)}`,
                    error: null,
                });

            case "youtube_play":
            case "youtube-play":
                return res.status(200).json({
                    success: true,
                    type: "youtube_play",
                    userinput,
                    content: userinput,
                    response: spokenResponse || `Playing ${userinput} on YouTube`,
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(userinput)}`,
                    error: null,
                });

            case "calculator_open":
                return res.status(200).json({
                    success: true,
                    type: "calculator_open",
                    userinput,
                    content: "calculator",
                    response: spokenResponse || "Opening calculator",
                    error: null,
                });

            case "instagram_open":
                return res.status(200).json({
                    success: true,
                    type: "instagram_open",
                    userinput,
                    content: "instagram",
                    response: spokenResponse || "Opening Instagram",
                    url: "https://www.instagram.com",
                    error: null,
                });

            case "facebook_open":
                return res.status(200).json({
                    success: true,
                    type: "facebook_open",
                    userinput,
                    content: "facebook",
                    response: spokenResponse || "Opening Facebook",
                    url: "https://www.facebook.com",
                    error: null,
                });

            case "weather_show":
            case "weather-show":
                return res.status(200).json({
                    success: true,
                    type: "weather-show",
                    userinput,
                    content: userinput,
                    response: spokenResponse || `Checking the weather for ${userinput || "your area"}`,
                    url: `https://www.google.com/search?q=${encodeURIComponent("weather " + (userinput || ""))}`,
                    error: null,
                });

            case "general":
            default:
                return res.status(200).json({
                    success: true,
                    type: "general",
                    userinput,
                    content: spokenResponse || gemResult.content || cleanJson || "I stand ready.",
                    response: spokenResponse || gemResult.content || cleanJson || "I stand ready.",
                    error: null,
                });
        }
    } catch (error) {
        console.error("Ask Astra error:", error);
        return res.status(500).json({
            success: false,
            content: null,
            error: error.message || "Failed to process transmission",
        });
    }
};
