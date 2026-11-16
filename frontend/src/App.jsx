import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserDataContext } from "./context/UserContext";
import SignUp from "./pages/signUp";
import SignIn from "./pages/signIn";
import Home from "./pages/Home";
import Customize from "./pages/Customize";
import background from "./assets/background.png";

function App() {
    const { userData, authLoading } = useContext(UserDataContext);

    if (authLoading) {
        return (
            <div
                className="w-full min-h-screen min-h-dvh bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${background})` }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#D4AF72] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#E8C98A] tracking-wider font-medium">Connecting to Astra...</p>
                </div>
            </div>
        );
    }

    const hasAssistantConfigured = Boolean(userData?.assistantName && userData?.assistantImage);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    !userData ? (
                        <Navigate to="/signin" replace />
                    ) : !hasAssistantConfigured ? (
                        <Navigate to="/customize" replace />
                    ) : (
                        <Home />
                    )
                }
            />

           
            <Route
                path="/customize"
                element={
                    !userData ? (
                        <Navigate to="/signin" replace />
                    ) : (
                        <Customize />
                    )
                }
            />

          
            <Route
                path="/signup"
                element={!userData ? <SignUp /> : <Navigate to="/" replace />}
            />
            <Route
                path="/signin"
                element={!userData ? <SignIn /> : <Navigate to="/" replace />}
            />

        
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
