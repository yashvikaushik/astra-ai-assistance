/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserDataContext = createContext(null);

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5002";

// Exported as a named export for standalone usage
export const geminiResponse = async (command, sessionId = null) => {
    try {
        const result = await axios.post(
            `${serverUrl}/api/user/ask-astra`,
            { command, sessionId },
            {
                withCredentials: true,
            }
        );

        return result.data;
    } catch (error) {
        console.error("Error getting Gemini response:", error.message);

        return {
            success: false,
            message: "Failed to get response from Gemini.",
        };
    }
};

// Exported as the single DEFAULT export so main.jsx can wrap the app
export default function UserContextProvider({ children }) {
    const [userData, setUserData] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/auth/me`, {
                    withCredentials: true,
                });
                setUserData(res.data);
                console.log(res.data);
            } catch (error) {
                setUserData(null);
                console.log(error);
            } finally {
                setAuthLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, {
                withCredentials: true,
            });
            setUserData(null);
            setCurrentSessionId(null);
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const value = {
        serverUrl,
        userData,
        setUserData,
        authLoading,
        logout,
        currentSessionId,
        setCurrentSessionId,
        geminiResponse,
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}
