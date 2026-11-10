import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup=async (req,res)=>{
    try{
    const {name,email,password}=req.body;

    if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

    const emailExists=await User.findOne({email});
    if(emailExists){
        return res.status(400).json({message:"The user with this email already exists!"})
    }

    if(password.length<6){
        return res.status(400).json(
            {message:"Password should be at least 6 characters long"})
    }

    const hashedPassword=await bcrypt.hash(password,10);

    const user=await User.create(
        {
            name,
            email,
            password:hashedPassword
        }
    );
    res.status(201).json(
        {
            message:"User created successfully",
            user
        }
    )
    }
    catch(error){
        console.log("Error in signup controller",error.message);
        res.status(500).json(
            {
                message:"Internal Server Error"
            }
        )
    }


}