import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

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
