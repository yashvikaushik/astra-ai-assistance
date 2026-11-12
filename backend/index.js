import express, { json } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5002;

app.get("/",(req,res) =>{
    console.log("The get request recieved");
    res.send("Astra AI Assistance API");
})

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRouter)

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