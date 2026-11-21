import { useState, useContext, useRef, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import CelestialBackground from "../components/CelestialBackground";
import agent2 from "../assets/agent2.png"; // Elara (primary female persona)
import agent3 from "../assets/agent3.png"; // Orion (male persona)
import {
    speakCelestialResponse,
    stopCelestialSpeech,
} from "../utils/speechVoice";
import {
    FiHome,
    FiMessageSquare,
    FiStar,
    FiPlus,
    FiPlay,
    FiLogOut,
    FiMic,
    FiVolume2,
    FiVolumeX,
    FiSend,
    FiTrash2,
    FiExternalLink,
    FiX,
    FiMenu,
} from "react-icons/fi";

function Home() {
    const { userData, authLoading, logout, serverUrl, currentSessionId, setCurrentSessionId } =
        useContext(UserDataContext);
    const navigate = useNavigate();

    // Determine persona & voice gender: Elara strictly female, Orion strictly male, or custom preference
    const isOrion = userData?.assistantName?.toLowerCase() === "orion";
    const defaultAvatar = isOrion ? agent3 : agent2;
    const currentAvatar = userData?.assistantImage || defaultAvatar;
    const currentName = userData?.assistantName || "Elara";
    const isMale =
        userData?.assistantGender === "male" ||
        (!userData?.assistantGender && isOrion);
    const targetGender = isMale ? "male" : "female";

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Greetings, ${userData?.name || "Explorer"}. I am ${currentName}, your celestial companion. What shall we explore today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);

    const [prompt, setPrompt] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [speechError, setSpeechError] = useState("");
    const [speakingIndex, setSpeakingIndex] = useState(null);

    // Navigation and Drawer toggles
    const [isConversationsDrawerOpen, setIsConversationsDrawerOpen] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [sessionsList, setSessionsList] = useState([]);

    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Latest assistant response for hero subtitle card
    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
    const activeSubtitleText = lastAssistantMsg
        ? lastAssistantMsg.content
        : `Greetings, ${userData?.name || "Explorer"}. I am standing by for your transmission.`;
    const activeSubtitleUrls = lastAssistantMsg?.urls || [];

    const fetchSessions = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/user/history`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setSessionsList(res.data.sessions || []);
            }
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
        }
    }, [serverUrl]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    useEffect(() => {
        let isMounted = true;
        const loadInitialSessions = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/user/history`, {
                    withCredentials: true,
                });
                if (isMounted && res.data.success) {
                    setSessionsList(res.data.sessions || []);
                }
            } catch (err) {
                console.error("Failed to load sessions:", err);
            }
        };

        if (userData) {
            loadInitialSessions();
        }

        return () => {
            isMounted = false;
        };
    }, [userData, serverUrl]);

    if (authLoading) {
        return (
            <CelestialBackground
                variant="auth"
                className="w-full min-h-screen min-h-dvh flex items-center justify-center"
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#D4AF72] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#E8C98A] tracking-wider font-medium">
                        Entering Astral Plane...
                    </p>
                </div>
            </CelestialBackground>
        );
    }

    if (!userData) {
        return <Navigate to="/signin" replace />;
    }

    const speakResponse = (text, msgIndex = null) => {
        if (isMuted || !text) return;
        setIsSpeaking(true);
        if (msgIndex !== null) setSpeakingIndex(msgIndex);

        speakCelestialResponse(text, {
            targetGender,
            assistantName: currentName,
            onStart: () => {
                setIsSpeaking(true);
                if (msgIndex !== null) setSpeakingIndex(msgIndex);
            },
            onEnd: () => {
                setIsSpeaking(false);
                setSpeakingIndex(null);
            },
            onError: () => {
                setIsSpeaking(false);
                setSpeakingIndex(null);
            },
        });
    };

    const stopSpeaking = () => {
        stopCelestialSpeech();
        setIsSpeaking(false);
        setSpeakingIndex(null);
        if (isListening && recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // Ignore stop error
            }
            setIsListening(false);
        }
    };

    const handleSendMessage = async (textToSend) => {
        const text = textToSend || prompt;
        if (!text.trim() || isSending) return;

        const userMsg = {
            role: "user",
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setPrompt("");
        setIsSending(true);

        try {
            const res = await axios.post(
                `${serverUrl}/api/user/ask-astra`,
                { command: text, sessionId: currentSessionId },
                { withCredentials: true }
            );

            const data = res.data;
            const assistantText = data.response || data.content || "Transmission processed.";

            if (data.sessionId && data.sessionId !== currentSessionId) {
                setCurrentSessionId(data.sessionId);
                fetchSessions();
            }

            const newMsgIndex = messages.length + 1;
            const assistantMsg = {
                role: "assistant",
                content: assistantText,
                type: data.type,
                urls: data.urls || (data.url ? [data.url] : []),
                url: data.url,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMessages((prev) => [...prev, assistantMsg]);
            speakResponse(assistantText, newMsgIndex);

            if (data.urls && data.urls.length > 0) {
                data.urls.forEach((targetUrl) => {
                    window.open(targetUrl, "_blank");
                });
            } else if (data.url) {
                window.open(data.url, "_blank");
            }
        } catch (err) {
            console.error("Transmission error:", err);
            const errorMsg = {
                role: "assistant",
                content:
                    err.response?.data?.error ||
                    "Communication disturbance across the cosmos. Please try again.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsSending(false);
        }
    };

    const loadSession = async (sId) => {
        try {
            const res = await axios.get(`${serverUrl}/api/user/history/${sId}`, {
                withCredentials: true,
            });
            if (res.data.success && res.data.session) {
                const rawMessages = res.data.session.messages || [];
                const formatted = rawMessages.map((m) => ({
                    role: m.role,
                    content: m.content,
                    type: m.type,
                    urls: m.urls || [],
                    timestamp: new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }));

                setMessages(
                    formatted.length > 0
                        ? formatted
                        : [
                              {
                                  role: "assistant",
                                  content: `Session resumed with ${currentName}. How can I assist?`,
                                  timestamp: new Date().toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  }),
                              },
                          ]
                );
                setCurrentSessionId(sId);
                setIsMobileSidebarOpen(false);
            }
        } catch (err) {
            console.error("Failed to load session:", err);
        }
    };

    const startNewChat = () => {
        stopSpeaking();
        setCurrentSessionId(null);
        setMessages([
            {
                role: "assistant",
                content: `Greetings, ${userData?.name || "Explorer"}. I am ${currentName}, your celestial companion. What shall we explore today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
        ]);
        setIsMobileSidebarOpen(false);
    };

    const deleteSession = async (sId, e) => {
        e.stopPropagation();
        try {
            await axios.delete(`${serverUrl}/api/user/history/${sId}`, {
                withCredentials: true,
            });
            setSessionsList((prev) => prev.filter((s) => s.sessionId !== sId));
            if (currentSessionId === sId) {
                startNewChat();
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };

    const clearAllSessions = async () => {
        if (!window.confirm("Are you sure you want to clear all archived transmissions?")) return;
        try {
            await axios.delete(`${serverUrl}/api/user/history`, {
                withCredentials: true,
            });
            setSessionsList([]);
            startNewChat();
        } catch (err) {
            console.error("Failed to clear all sessions:", err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleSpeechRecognition = () => {
        if (isSpeaking) {
            stopSpeaking();
        }

        if (isListening) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore stop error
                }
            }
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechError("Speech recognition is not supported in this browser. Please use Google Chrome.");
            return;
        }

        setSpeechError("");
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onerror = (e) => {
            setIsListening(false);
            if (e.error === "network") {
                setSpeechError(
                    "Google speech service unreachable. If using Brave/VPN, disable Shields/VPN, or type using the keyboard icon."
                );
            } else if (e.error === "not-allowed") {
                setSpeechError(
                    "Microphone permission denied. Please allow microphone permissions in Chrome and macOS Settings."
                );
            } else if (e.error === "audio-capture") {
                setSpeechError("No microphone detected. Please check your audio input device.");
            } else if (e.error !== "no-speech") {
                setSpeechError(`Speech recognition error: ${e.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (e) => {
            const transcript = e.results[e.results.length - 1][0].transcript;
            setPrompt(transcript);
            handleSendMessage(transcript);
        };

        try {
            recognition.start();
        } catch (err) {
            console.error("Failed to start recognition:", err);
            setIsListening(false);
        }
    };

    // Staggered equalizer waveform heights
    const waveformBars = [4, 8, 14, 22, 16, 28, 20, 10, 18, 26, 32, 24, 18, 28, 14, 22, 16, 8, 12, 6];

    return (
        <CelestialBackground
            variant="dashboard"
            className="w-full h-screen h-dvh flex text-white relative overflow-hidden select-none"
        >
            <div className="w-full h-full flex relative z-10 overflow-hidden">

            {/* Mobile Header Toggle */}
            <div className="lg:hidden absolute top-4 left-4 z-40">
                <button
                    onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
                    className="p-2.5 rounded-xl bg-[#17111F]/90 border border-[#D4AF72]/40 text-[#E8C98A] shadow-lg cursor-pointer"
                    title="Toggle Sidebar"
                >
                    {isMobileSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
            </div>

            {/* 1. LEFT SIDEBAR DOCK */}
            <aside
                className={`fixed lg:relative top-0 left-0 h-full w-72 sm:w-80 bg-[#0E0916]/95 lg:bg-[#0E0916]/85 border-r border-[#D4AF72]/20 backdrop-blur-2xl z-30 p-5 flex flex-col justify-between shadow-[8px_0_35px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(212,175,114,0.4)] flex-shrink-0">
                            ✦
                        </div>
                        <div>
                            <h2 className="text-base font-serif font-bold tracking-[0.2em] text-[#E8C98A] uppercase">
                                ASTRA
                            </h2>
                            <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                                AI Companion
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="mt-5 space-y-1.5">
                        {/* Start New Conversation Button */}
                        <button
                            onClick={startNewChat}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#D4AF72]/15 hover:bg-[#D4AF72]/25 border border-[#D4AF72]/30 hover:border-[#D4AF72]/60 text-[#E8C98A] hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer text-left group"
                            title="Start a new conversation"
                        >
                            <FiPlus size={16} className="text-[#D4AF72] group-hover:scale-110 transition-transform" />
                            <span>New Conversation</span>
                        </button>

                        {/* Home Button (Active Pill) */}
                        <button
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF72]/20 via-[#D4AF72]/10 to-transparent border border-[#D4AF72]/40 text-[#E8C98A] text-xs font-semibold shadow-[0_0_15px_rgba(212,175,114,0.15)] transition-all cursor-pointer text-left"
                        >
                            <FiHome size={16} className="text-[#D4AF72]" />
                            <span>Home</span>
                        </button>

                        {/* Conversations Button (Toggles Drawer) */}
                        <button
                            onClick={() => setIsConversationsDrawerOpen(true)}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#E8C98A] text-xs font-semibold transition-all cursor-pointer text-left"
                        >
                            <FiMessageSquare size={16} />
                            <span>Conversations</span>
                        </button>

                        {/* Persona Button (Routes to Customize) */}
                        <button
                            onClick={() => navigate("/customize")}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-[#E8C98A] text-xs font-semibold transition-all cursor-pointer text-left"
                        >
                            <FiStar size={16} />
                            <span>Persona</span>
                        </button>
                    </nav>

                    {/* Recent Conversations Section */}
                    <div className="mt-6 flex-1 overflow-hidden flex flex-col min-h-0">
                        <div className="px-2 mb-2">
                            <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                                Recent Conversations
                            </span>
                        </div>

                        {/* Sessions List */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                            {sessionsList.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 text-[11px]">
                                    No recent conversations.
                                </div>
                            ) : (
                                sessionsList.map((session) => (
                                    <div
                                        key={session.sessionId}
                                        onClick={() => loadSession(session.sessionId)}
                                        className={`group px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                            currentSessionId === session.sessionId
                                                ? "bg-[#D4AF72]/15 border-[#D4AF72]/60 text-[#E8C98A] shadow-[0_0_12px_rgba(212,175,114,0.15)]"
                                                : "bg-[#140E1E]/50 border-white/5 hover:border-[#D4AF72]/30 hover:bg-[#140E1E] text-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                    currentSessionId === session.sessionId
                                                        ? "bg-[#D4AF72] text-black"
                                                        : "bg-white/5 text-gray-400 group-hover:text-[#E8C98A]"
                                                }`}
                                            >
                                                <FiPlay size={10} />
                                            </div>
                                            <div className="min-w-0 flex-1 text-left">
                                                <p className="text-xs font-medium truncate group-hover:text-[#E8C98A]">
                                                    {session.title || "Transmission"}
                                                </p>
                                                <p className="text-[10px] text-gray-500">
                                                    {new Date(session.startedAt).toLocaleDateString([], {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                    {" • "}
                                                    {session.messageCount || 1} turns
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => deleteSession(session.sessionId, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity cursor-pointer"
                                            title="Delete Session"
                                        >
                                            <FiTrash2 size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                    {/* Atmospheric Cosmic Graphic Banner */}
                    <div
                        className="w-full h-18 rounded-2xl border border-[#D4AF72]/20 overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-gradient-to-tr from-[#160E24] via-[#2A183C] to-[#120B1D] flex items-end p-2.5"
                    >
                        <div className="absolute inset-0 bg-radial from-[#D4AF72]/15 via-transparent to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <span className="text-[9px] font-bold text-[#E8C98A] tracking-wider uppercase block">
                                Astral Plane Active
                            </span>
                            <span className="text-[8px] text-gray-400 font-mono block">
                                Tuned to {currentName} ({targetGender === "male" ? "♂ Male Voice" : "♀ Female Voice"})
                            </span>
                        </div>
                    </div>

                    {/* User Profile Card (No Pro Member badge) */}
                    <div className="p-2.5 rounded-2xl bg-[#17111F]/80 border border-white/10 flex items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full border border-[#D4AF72] overflow-hidden flex-shrink-0 bg-black/50">
                                <img
                                    src={currentAvatar}
                                    alt={userData.name}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                            <div className="min-w-0 text-left">
                                <p className="text-xs font-semibold text-gray-100 truncate">
                                    {userData.name || "Explorer"}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                    {userData.email}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 hover:text-red-200 transition-all cursor-pointer"
                            title="Sign Out"
                        >
                            <FiLogOut size={13} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* 2. MAIN CELESTIAL STAGE (CENTER & RIGHT) */}
            <main className="flex-1 h-full flex flex-col justify-between items-center relative z-10 px-4 sm:px-8 py-6 overflow-hidden">
                {/* Top Action Bar */}
                <div className="w-full flex items-center justify-between z-20">
                    {/* Left spacer for mobile alignment */}
                    <div className="w-8 lg:w-40" />

                    {/* Centered Persona Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif tracking-[0.25em] text-[#E8C98A] uppercase font-bold drop-shadow-[0_0_25px_rgba(212,175,114,0.45)]">
                                {currentName}
                            </h1>
                            <span className="hidden sm:inline-flex text-[10px] text-[#D4AF72] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-[#D4AF72]/15 border border-[#D4AF72]/30">
                                {targetGender === "male" ? "♂ Male Voice" : "♀ Female Voice"}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 tracking-wider font-light mt-0.5">
                            Your Celestial AI Companion
                        </p>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 sm:gap-3 w-auto justify-end">
                        {/* Start New Conversation Pill Button */}
                        <button
                            onClick={startNewChat}
                            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#18111e]/85 hover:bg-[#D4AF72]/20 border border-[#D4AF72]/40 text-xs font-semibold text-[#E8C98A] hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer active:scale-95"
                            title="Start a new conversation"
                        >
                            <FiPlus size={13} className="text-[#D4AF72]" />
                            <span className="hidden sm:inline">New Conversation</span>
                        </button>

                        {/* Customize Persona Pill Button */}
                        <button
                            onClick={() => navigate("/customize")}
                            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#18111e]/85 hover:bg-[#D4AF72]/20 border border-[#D4AF72]/40 text-xs font-semibold text-[#E8C98A] hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
                        >
                            <FiStar size={13} className="text-[#D4AF72]" />
                            <span>Customize Persona</span>
                        </button>

                        {/* Audio Mute/Unmute */}
                        <button
                            onClick={() => {
                                if (!isMuted) {
                                    stopCelestialSpeech();
                                }
                                setIsMuted((prev) => !prev);
                            }}
                            className={`p-2 sm:p-2.5 rounded-full border transition-all cursor-pointer shadow-md ${
                                isMuted
                                    ? "bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25"
                                    : "bg-[#18111e]/85 border-[#D4AF72]/40 text-[#E8C98A] hover:bg-[#D4AF72]/20"
                            }`}
                            title={isMuted ? "Audio Muted (Click to Unmute)" : "Voice Active (Click to Mute)"}
                        >
                            {isMuted ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                        </button>
                    </div>
                </div>

                {/* Central Celestial Stage & Hero Avatar */}
                <div className="relative flex-1 flex flex-col items-center justify-center my-auto w-full max-w-2xl text-center py-4">
                    {/* Ambient Starlight Radial Glow */}
                    <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#D4AF72]/15 blur-3xl pointer-events-none" />

                    {/* Rotating Orbital Concentric Rings */}
                    <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-[#D4AF72]/25 animate-orbit-slow pointer-events-none">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#E8C98A] shadow-[0_0_12px_#D4AF72]" />
                    </div>
                    <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-dashed border-[#E8C98A]/20 animate-orbit-reverse pointer-events-none" />

                    {/* Hero Avatar Orb */}
                    <div
                        className={`relative z-10 w-48 h-48 sm:w-60 sm:h-60 rounded-full border-3 sm:border-4 overflow-hidden bg-black/60 transition-all duration-500 ${
                            isSpeaking
                                ? "border-[#FFF0C0] shadow-[0_0_70px_rgba(212,175,114,0.85),inset_0_0_30px_rgba(212,175,114,0.6)] scale-102"
                                : isListening
                                ? "border-amber-400 shadow-[0_0_70px_rgba(245,158,11,0.7),inset_0_0_30px_rgba(245,158,11,0.5)] scale-102"
                                : "border-[#D4AF72] shadow-[0_0_50px_rgba(212,175,114,0.45),inset_0_0_20px_rgba(212,175,114,0.3)] animate-pulse-glow"
                        }`}
                    >
                        <img
                            src={currentAvatar}
                            alt={currentName}
                            className="w-full h-full object-cover object-top"
                        />
                    </div>

                    {/* Audio Waveform Equalizer */}
                    <div className="mt-6 flex items-center justify-center gap-1 sm:gap-1.5 h-8">
                        {waveformBars.map((barHeight, i) => (
                            <span
                                key={i}
                                className="w-1 rounded-full bg-gradient-to-t from-[#D4AF72] via-[#E8C98A] to-[#FFF0C0] transition-all duration-200"
                                style={{
                                    height:
                                        isSpeaking || isListening
                                            ? `${Math.max(6, barHeight * (isSpeaking ? 1.05 : 0.75))}px`
                                            : "4px",
                                    opacity: isSpeaking || isListening ? 0.95 : 0.35,
                                    animation:
                                        isSpeaking || isListening
                                            ? `waveform-bar 1.2s ease-in-out infinite ${i * 0.06}s`
                                            : "none",
                                }}
                            />
                        ))}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2 text-center">
                        {isSpeaking ? (
                            <p className="text-xs sm:text-sm font-semibold text-[#E8C98A] tracking-widest uppercase animate-pulse">
                                Speaking...
                            </p>
                        ) : isListening ? (
                            <p className="text-xs sm:text-sm font-semibold text-emerald-300 tracking-widest uppercase animate-pulse">
                                Listening... Speak into your mic
                            </p>
                        ) : isSending ? (
                            <p className="text-xs sm:text-sm font-semibold text-amber-200 tracking-widest uppercase animate-pulse">
                                Synthesizing response...
                            </p>
                        ) : (
                            <p className="text-[11px] text-gray-400 tracking-widest uppercase font-medium">
                                Standing by...
                            </p>
                        )}
                    </div>

                    {/* Dynamic Subtitle / Response Card */}
                    <div className="mt-4 w-full max-w-xl px-4">
                        <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#17111F]/80 border border-[#D4AF72]/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center">
                            <p className="text-xs sm:text-sm md:text-base text-gray-100 font-normal leading-relaxed">
                                {isSending ? `${currentName} is consulting the astral plane...` : activeSubtitleText}
                            </p>

                            {/* External action link pills */}
                            {activeSubtitleUrls && activeSubtitleUrls.length > 0 && (
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-2 border-t border-white/10">
                                    {activeSubtitleUrls.map((u, i) => (
                                        <a
                                            key={i}
                                            href={u}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF72]/20 hover:bg-[#D4AF72]/30 border border-[#D4AF72]/40 text-xs font-semibold text-[#E8C98A] transition-colors"
                                        >
                                            <span>Open Target Link</span>
                                            <FiExternalLink size={12} />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Speech Error Diagnostic Banner */}
                    {speechError && (
                        <div className="w-full max-w-lg mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-2 text-left">
                                <span>⚠️</span>
                                <span>{speechError}</span>
                            </div>
                            <button
                                onClick={() => setSpeechError("")}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold ml-2 cursor-pointer transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </div>

                {/* Floating Keyboard Input Prompt Bar (When toggled) */}
                {isKeyboardOpen && (
                    <div className="w-full max-w-2xl px-4 mb-3 z-30 animate-float-gentle">
                        <div className="w-full p-3 rounded-2xl bg-[#17111F]/95 backdrop-blur-2xl border border-[#D4AF72]/50 shadow-[0_0_35px_rgba(0,0,0,0.8)] flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    placeholder={`Transmit query to ${currentName}...`}
                                    disabled={isSending}
                                    autoFocus
                                    className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none resize-none max-h-24 disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleSendMessage()}
                                    disabled={!prompt.trim() || isSending}
                                    className="p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] text-black hover:opacity-95 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(212,175,114,0.35)] cursor-pointer font-bold"
                                    title="Send Transmission"
                                >
                                    <FiSend size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsKeyboardOpen(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    title="Close Keyboard"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>

                            {/* Quick Suggestion Chips */}
                            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-[11px] scrollbar-none">
                                {[
                                    "Capital of India",
                                    "Tell me the time",
                                    "Open YouTube and play music",
                                    "Tell me today's date",
                                ].map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#D4AF72]/20 border border-white/10 hover:border-[#D4AF72]/40 text-gray-300 hover:text-[#E8C98A] transition-all whitespace-nowrap cursor-pointer"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. BOTTOM CONTROL PEDESTAL & DOCK */}
                <div className="w-full max-w-md flex flex-col items-center justify-center z-20 pb-2">
                    {/* Glowing Floor Pedestal Reflection Ring */}
                    <div className="w-72 sm:w-96 h-10 rounded-[100%] border border-[#D4AF72]/30 bg-radial from-[#D4AF72]/25 via-transparent to-transparent blur-[1px] pointer-events-none mb-1 shadow-[0_0_30px_rgba(212,175,114,0.25)]" />

                    {/* Tri-Control Button Dock */}
                    <div className="flex items-center justify-center gap-6 sm:gap-8 -mt-6">
                        {/* 1. Keyboard Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setIsKeyboardOpen((prev) => !prev)}
                            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] cursor-pointer hover:scale-105 active:scale-95 ${
                                isKeyboardOpen
                                    ? "bg-[#D4AF72] border-[#D4AF72] text-black"
                                    : "bg-[#18111e]/90 hover:bg-[#D4AF72]/20 border-[#D4AF72]/40 text-[#E8C98A] hover:text-white"
                            }`}
                            title={isKeyboardOpen ? "Hide Keyboard" : "Type Query (Keyboard Mode)"}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                                <line x1="6" y1="8" x2="6.01" y2="8" />
                                <line x1="10" y1="8" x2="10.01" y2="8" />
                                <line x1="14" y1="8" x2="14.01" y2="8" />
                                <line x1="18" y1="8" x2="18.01" y2="8" />
                                <line x1="6" y1="12" x2="6.01" y2="12" />
                                <line x1="10" y1="12" x2="10.01" y2="12" />
                                <line x1="14" y1="12" x2="14.01" y2="12" />
                                <line x1="18" y1="12" x2="18.01" y2="12" />
                                <line x1="8" y1="16" x2="16" y2="16" />
                            </svg>
                        </button>

                        {/* 2. Hero Center Microphone Button */}
                        <button
                            type="button"
                            onClick={toggleSpeechRecognition}
                            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all cursor-pointer relative hover:scale-105 active:scale-95 ${
                                isListening
                                    ? "bg-gradient-to-tr from-amber-500 via-red-500 to-amber-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.8)]"
                                    : "bg-gradient-to-tr from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] text-black shadow-[0_0_40px_rgba(212,175,114,0.7)]"
                            }`}
                            title={isListening ? "Listening... Click to stop" : "Speak to Companion"}
                        >
                            {isListening && (
                                <div className="absolute -inset-2.5 rounded-full border-2 border-red-500 animate-ping opacity-40 pointer-events-none" />
                            )}
                            <FiMic size={28} />
                        </button>

                        {/* Balance spacer so mic remains centered over glowing pedestal */}
                        <div className="w-12 h-12 pointer-events-none" aria-hidden="true" />
                    </div>
                </div>
            </main>

            {/* 4. SLIDE-OVER CONVERSATIONS ARCHIVES DRAWER */}
            {isConversationsDrawerOpen && (
                <>
                    <div
                        onClick={() => setIsConversationsDrawerOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    />
                    <aside className="fixed top-0 right-0 h-full w-84 sm:w-96 bg-[#120D1B]/95 border-l border-[#D4AF72]/30 backdrop-blur-2xl z-50 p-5 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.8)]">
                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2 text-[#E8C98A]">
                                    <FiMessageSquare size={16} />
                                    <h3 className="font-extrabold tracking-wider text-sm uppercase">
                                        Active Conversation
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsConversationsDrawerOpen(false)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            {/* New Transmission Action */}
                            <button
                                onClick={() => {
                                    startNewChat();
                                    setIsConversationsDrawerOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] text-black font-bold text-xs shadow-[0_0_15px_rgba(212,175,114,0.3)] hover:opacity-95 transition-all cursor-pointer"
                            >
                                <FiPlus size={16} />
                                <span>Start New Transmission</span>
                            </button>

                            {/* Full Message Stream */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col ${
                                            msg.role === "user" ? "items-end" : "items-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                                                msg.role === "user"
                                                    ? "bg-gradient-to-r from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] text-black font-semibold rounded-tr-none"
                                                    : "bg-[#17111F]/90 border border-[#D4AF72]/30 text-gray-200 rounded-tl-none"
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>

                                            {msg.urls && msg.urls.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {msg.urls.map((u, i) => (
                                                        <a
                                                            key={i}
                                                            href={u}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D4AF72]/20 hover:bg-[#D4AF72]/30 text-[10px] font-semibold text-[#E8C98A]"
                                                        >
                                                            <span>Link {i + 1}</span>
                                                            <FiExternalLink size={10} />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                                                {msg.role === "assistant" && (
                                                    <button
                                                        onClick={() => speakResponse(msg.content, index)}
                                                        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#E8C98A] cursor-pointer"
                                                    >
                                                        <FiVolume2
                                                            size={11}
                                                            className={
                                                                speakingIndex === index ? "text-[#D4AF72]" : ""
                                                            }
                                                        />
                                                        <span>
                                                            {speakingIndex === index ? "Speaking..." : "Replay"}
                                                        </span>
                                                    </button>
                                                )}
                                                <span className="text-[9px] font-mono opacity-60 ml-auto">
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                        </div>

                        {/* Drawer Footer Actions */}
                        {sessionsList.length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                                <button
                                    onClick={clearAllSessions}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-all cursor-pointer"
                                >
                                    <FiTrash2 size={13} />
                                    <span>Purge All Transmissions</span>
                                </button>
                            </div>
                        )}
                    </aside>
                </>
            )}
            </div>
        </CelestialBackground>
    );
}

export default Home;
