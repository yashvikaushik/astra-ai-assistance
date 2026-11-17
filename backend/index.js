import express, { json } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import geminiResponse from "./gemini.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5002;

// app.get("/",(req,res) =>{
//     console.log("The get request recieved");
//     res.send("Astra AI Assistance API");
// })

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter);

app.get("/", async (req, res) => {
    try {
        console.log("hit the ai end point");
        const prompt = req.query.prompt;
        console.log(prompt);

        const data = await geminiResponse(prompt);

        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();