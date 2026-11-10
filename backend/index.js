import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5002;

app.get("/",(req,res) =>{
    console.log("The get request recieved");
    res.send("Astra AI Assistance API");
})



app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});