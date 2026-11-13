/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const UserDataContext = createContext(null);

export default function UserContextProvider({ children }) {
    const [userData, setUserData] = useState(null);
    const serverUrl = "http://localhost:5002";

    const value = {
        serverUrl,
        userData,
        setUserData,
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}
