import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const geminiResponse = async (command, assistantName = "Astra", userName = "User") => {
    try {
        const rawUrl =
            process.env.GEMINI_API_URL ||
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing from environment variables.");
        }

        const baseUrl = rawUrl.split("?")[0];

        const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
    "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
            "get_time" | "get_date" | "get_day" | "get_month" |
            "calculator_open" | "instagram_open" | "facebook_open" |
            "weather-show",

    "userinput": "<original user input>"
                  (only remove your name from userinput if it exists).
                  If someone asks to search something on Google or YouTube,
                  only the search-related text should be in userinput,

    "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g.,
  "Sure, playing it now", "Here's what I found",
  "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question.
- "google_search": if user wants to search something on Google.
- "youtube_search": if user wants to search something on YouTube.
- "youtube_play": if user wants to directly play a video or song.
- "calculator_open": if user wants to open a calculator.
- "instagram_open": if user wants to open Instagram.
- "facebook_open": if user wants to open Facebook.
- "weather-show": if user wants to know the weather.
- "get_time": if user asks for current time.
- "get_date": if user asks for today's date.
- "get_day": if user asks what day it is.
- "get_month": if user asks for the current month.

Important:
- Use "${userName}" if someone asks who made you.
- Only respond with the JSON object, nothing else.

Now your userInput - ${command}`;

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

        if (result.data?.usageMetadata) {
            console.log("Token Usage:", result.data.usageMetadata);
        }

        const replyText = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return replyText;
    } catch (error) {
        console.error("Status:", error.response?.status);
        console.error("Gemini error:", error.response?.data || error.message);
        throw error;
    }
};

export default geminiResponse;
