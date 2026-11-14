/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserDataContext = createContext(null);

export default function UserContextProvider({ children }) {
    const [userData, setUserData] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const serverUrl = "http://localhost:5002";

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/auth/me`, {
                    withCredentials: true,
                });
                setUserData(res.data);
            } catch {
                setUserData(null);
            } finally {
                setAuthLoading(false);
            }
        };

        checkAuth();
    }, [serverUrl]);

    const logout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, {
                withCredentials: true,
            });
            setUserData(null);
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
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}
