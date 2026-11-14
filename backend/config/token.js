import jwt from "jsonwebtoken";

const genToken = (userID) => {
    try {
        const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return token;
    } catch (error) {
        console.error("Error generating token:", error.message);
        throw error;
    }
};

export default genToken;