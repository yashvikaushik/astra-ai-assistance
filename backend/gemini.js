import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const geminiResponse = async (
    command,
    assistantName = "Elara",
    userName = "Explorer",
    conversationHistory = []
) => {
    try {
        const rawUrl =
            process.env.GEMINI_API_URL ||
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing from environment variables.");
        }

        const baseUrl = rawUrl.split("?")[0];

        // Format recent conversation history for multi-turn contextual memory
        let historySection = "No previous conversation turns in this session.";
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            const formattedTurns = conversationHistory
                .map((m) => {
                    const speaker = m.role === "user" ? userName : assistantName;
                    return `${speaker}: ${m.content}`;
                })
                .join("\n");
            historySection = `Recent Conversation History in this session (use this to remember previous questions, topics, user preferences, and follow-ups):
---
${formattedTurns}
---`;
        }

        const prompt = `You are an intelligent, articulate, voice-enabled AI companion named ${assistantName} created by ${userName}.
You behave like a helpful, celestial companion with deep knowledge and conversational memory.

${historySection}

Current User Input from ${userName}: "${command}"

Your task is to understand the user's natural language input—whether it is a factual question, a conversational remark, a single instruction, or multiple combined statements (e.g. "open instagram and tell me the time")—and respond ONLY with a JSON object in this exact schema:

{
    "actions": [
        {
            "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
                    "get_time" | "get_date" | "get_day" | "get_month" | "get_year" |
                    "calculator_open" | "instagram_open" | "facebook_open" |
                    "weather-show",
            "userinput": "<clean query or topic for this action>"
        }
    ],
    "response": "<the spoken response that directly answers the user or confirms actions>"
}

Strict Rules:
1. "type" Selection:
   - "general": ALWAYS use this for factual questions, educational queries, science, history, politics, definitions, chit-chat, or explanations (e.g. "who is the president of USA?", "what is the capital of France?", "tell me a joke", "explain quantum computing", "how are you?").
     CRITICAL: For "general" questions, you MUST provide the complete, accurate, and concise answer directly inside the "response" field. NEVER say "I can help with that, let me look into it" or stall—provide the actual factual answer immediately!
   - "google_search": ONLY use this when the user EXPLICITLY asks to search Google (e.g., "search Google for...", "google quantum physics"). Do NOT use this for normal questions like "who is...", "what is...", or "why is...".
   - "youtube_search": search something on YouTube (userinput must contain only the search topic).
   - "youtube_play": play a video or music on YouTube (userinput must contain only the song/video title or artist).
   - "calculator_open": open a calculator.
   - "instagram_open": open Instagram.
   - "facebook_open": open Facebook.
   - "weather-show": check weather for a location (userinput has the city/location).
   - "get_time": user asks for current time.
   - "get_date": user asks for today's date.
   - "get_day": user asks what day of the week it is.
   - "get_month": user asks for current month.
   - "get_year": user asks for current year.

2. "actions":
   - An array containing one or more action objects in order of requested execution.
   - If the user gave a single request, "actions" has 1 item.
   - If the user gave a compound request (e.g., "open Instagram and tell me the time"), break it into multiple action objects in the "actions" array.

3. "response" Spoken Reply:
   - For factual or conversational queries ("general"): Provide the direct, informative, natural spoken answer to the user's question.
   - For external app/web actions: Provide a friendly spoken confirmation of the actions being performed (e.g. "Opening Instagram now, and checking the current time.").
   - Keep answers concise and optimized for spoken voice output (1-3 sentences), avoiding markdown asterisks or code formatting.
   - If someone asks who created you, state that you were created by ${userName}.
   - If the user asks a follow-up referring to earlier messages (e.g., "who was before him?", "what did I say earlier?"), use the conversation context above to answer accurately.

4. Output Format:
   - Output ONLY the raw JSON object. Do not wrap in markdown or backticks. No extra text before or after.`;

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
