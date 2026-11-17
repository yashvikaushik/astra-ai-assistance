import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const geminiResponse = async (prompt) => {
    try {
        const rawUrl =
            process.env.GEMINI_API_URL ||
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing from environment variables.");
        }

        const baseUrl = rawUrl.split("?")[0];

        const result = await axios.post(
            `${baseUrl}?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );  

        console.log("Token Usage:", result.data.usageMetadata);

        return result.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Status:", error.response?.status);
        console.error("Gemini error:", error.response?.data || error.message);
        throw error;
    }
};

export default geminiResponse;
