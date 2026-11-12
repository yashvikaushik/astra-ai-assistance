import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

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

    const token=genToken(user._id);

    res.cookie("token",token,{
        httponly:true,
        maxAge:10*60*60*1000,//value given in millisecond
        sameSite:"strict"
    })

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

export const login=async (req,res)=>{
    try{
        const{email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json(
                {
                    message:"User not found"
                }
            )
        }

        const matchedPassword=bcrypt.compare(password,user?.password);
        if(!matchedPassword){
            return res.status(400).json({
                message:"Incorrect password"
            })
        }

        const token=genToken(user._id);
        res.cookie("token",token,{
            httponly:true,
            maxAge:10*60*60*1000,
            sameSite:"strict"
        });

        res.status(200).json({
            message:"User logged in successfully",
            user
        })

    }
    catch(error){

    }

}


export const logout=(req,res)=>{
    try{
        res.clearCookie("token");
        res.status(200).json({
            message:"Logged out successfully"
        })

    }
    catch(error){
    console.log("Error in logout controller",error.message);
    res.status(500).json(
            {
                message:"Internal Server Error"
            }
        )

    }
}