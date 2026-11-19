import { useState, useContext, useRef, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import background from "../assets/background.png";
import agent1 from "../assets/agent1.png";
import {
    FiSend,
    FiMic,
    FiLogOut,
    FiSettings,
    FiStar,
    FiCompass,
    FiZap,
    FiCode,
    FiMessageSquare,
    FiExternalLink,
} from "react-icons/fi";

function Home() {
    const { userData, authLoading, logout, serverUrl } = useContext(UserDataContext);
    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Greetings, ${userData?.name || "Explorer"}. I am ${userData?.assistantName || "Astra Nova"}, your celestial companion. What shall we explore today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);
    const [prompt, setPrompt] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    if (authLoading) {
        return (
            <div
                className="w-full min-h-screen min-h-dvh bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${background})` }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#D4AF72] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#E8C98A] tracking-wider font-medium">Entering Astral Plane...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return <Navigate to="/signin" replace />;
    }

    const currentAvatar = userData.assistantImage || agent1;
    const currentName = userData.assistantName || "Astra Nova";

    const speakResponse = (text) => {
        if ("speechSynthesis" in window && text) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn("Speech synthesis error:", e);
            }
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
                { command: text },
                { withCredentials: true }
            );

            const data = res.data;
            const assistantText = data.response || data.content || "Transmission processed.";

            const assistantMsg = {
                role: "assistant",
                content: assistantText,
                type: data.type,
                url: data.url,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMessages((prev) => [...prev, assistantMsg]);
            speakResponse(assistantText);

            if (data.url) {
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

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please try Google Chrome.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setPrompt(transcript);
            handleSendMessage(transcript);
        };

        recognition.start();
    };

    const quickCards = [
        {
            icon: FiCompass,
            title: "Strategic Focus",
            desc: "Plan my weekly workflow and key priorities",
        },
        {
            icon: FiZap,
            title: "Creative Sparks",
            desc: "Brainstorm 5 innovative startup concepts",
        },
        {
            icon: FiCode,
            title: "Code Architecture",
            desc: "Explain how React Context works with state",
        },
        {
            icon: FiMessageSquare,
            title: "Executive Drafting",
            desc: "Draft a concise project update for my team",
        },
    ];

    return (
        <div
            className="w-full min-h-screen min-h-dvh bg-cover bg-center bg-fixed flex flex-col justify-between text-white"
            style={{ backgroundImage: `url(${background})` }}
        >
            {/* Celestial Top Navigation */}
            <header className="w-full px-4 sm:px-8 py-3.5 bg-[#17111F]/85 backdrop-blur-2xl border-b border-[#D4AF72]/30 flex items-center justify-between z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_15px_rgba(212,175,114,0.4)]">
                        A
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm sm:text-base font-extrabold tracking-widest text-[#E8C98A]">
                                ASTRA AI
                            </h1>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Online
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-300 -mt-0.5">
                            Companion: <span className="text-[#E8C98A] font-semibold">{currentName}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-4">
                    {/* Customize Button -> Takes user to Customize page */}
                    <button
                        onClick={() => navigate("/customize")}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#D4AF72]/15 hover:bg-[#D4AF72]/25 border border-[#D4AF72]/40 text-xs font-semibold text-[#E8C98A] hover:text-white transition-all shadow-sm hover:shadow-[#D4AF72]/20 cursor-pointer"
                        title="Customize Persona"
                    >
                        <FiSettings size={14} className="text-[#D4AF72]" />
                        <span>Customize Persona</span>
                    </button>

                    <div className="flex items-center gap-2.5 pl-2 border-l border-white/15">
                        <div className="relative w-9 h-9 rounded-full border border-[#D4AF72] overflow-hidden shadow-[0_0_10px_rgba(212,175,114,0.3)] bg-black/40">
                            <img src={currentAvatar} alt={currentName} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-xs font-semibold text-gray-100">{userData.name}</span>
                            <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{userData.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs transition-all cursor-pointer"
                            title="Sign Out"
                        >
                            <FiLogOut size={15} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Central Chat & Interaction Stage */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {/* Ambient Hero Card (Shown when conversation is new) */}
                    {messages.length <= 1 && (
                        <div className="my-6 p-6 sm:p-8 rounded-3xl bg-[#17111F]/80 border border-[#D4AF72]/35 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-center space-y-4">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#D4AF72] shadow-[0_0_40px_rgba(212,175,114,0.45)] overflow-hidden bg-black/50 mx-auto">
                                    <img
                                        src={currentAvatar}
                                        alt={currentName}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#17111F] border border-[#D4AF72]/60 text-[#E8C98A]">
                                    <FiStar size={14} />
                                </div>
                            </div>

                            <div className="space-y-1.5 max-w-lg mx-auto">
                                <div className="inline-block px-3 py-0.5 rounded-full bg-[#D4AF72]/15 border border-[#D4AF72]/30 text-[11px] font-semibold tracking-widest text-[#E8C98A] uppercase">
                                    Active Persona
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8C98A] tracking-wider">
                                    {currentName}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                                    Your celestial virtual companion is tuned and ready. Tap a topic below or speak your query into the cosmic terminal.
                                </p>
                            </div>

                            {/* 2×2 Quick Prompts Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                                {quickCards.map((card, idx) => {
                                    const IconComponent = card.icon;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(card.desc)}
                                            disabled={isSending}
                                            className="group p-3.5 rounded-2xl bg-[#17111F]/70 hover:bg-[#17111F]/95 border border-[#D4AF72]/20 hover:border-[#D4AF72]/60 transition-all flex items-start gap-3 backdrop-blur-md shadow-sm hover:shadow-[0_0_20px_rgba(212,175,114,0.2)] cursor-pointer disabled:opacity-50"
                                        >
                                            <div className="p-2 rounded-xl bg-[#D4AF72]/15 text-[#E8C98A] group-hover:bg-[#D4AF72] group-hover:text-black transition-colors flex-shrink-0 mt-0.5">
                                                <IconComponent size={16} />
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <h4 className="text-xs font-bold text-[#E8C98A] tracking-wide">
                                                    {card.title}
                                                </h4>
                                                <p className="text-[11px] text-gray-300 leading-snug truncate">
                                                    {card.desc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Messages List */}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-9 h-9 rounded-full bg-[#17111F] border border-[#D4AF72]/50 flex-shrink-0 flex items-center justify-center overflow-hidden mt-1 shadow-[0_0_12px_rgba(212,175,114,0.25)]">
                                    <img src={currentAvatar} alt={currentName} className="w-full h-full object-cover object-top" />
                                </div>
                            )}

                            <div
                                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                                    msg.role === "user"
                                        ? "bg-gradient-to-r from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] text-black font-semibold rounded-tr-none shadow-[#D4AF72]/20"
                                        : "bg-[#17111F]/85 border border-[#D4AF72]/30 text-gray-100 backdrop-blur-md rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.content}</p>

                                {msg.url && (
                                    <a
                                        href={msg.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-[#D4AF72]/20 hover:bg-[#D4AF72]/30 border border-[#D4AF72]/40 text-xs font-semibold text-[#E8C98A] transition-colors"
                                    >
                                        <span>Open Transmission</span>
                                        <FiExternalLink size={12} />
                                    </a>
                                )}

                                <span
                                    className={`block text-[10px] mt-1.5 text-right font-mono ${
                                        msg.role === "user" ? "text-black/70" : "text-gray-400"
                                    }`}
                                >
                                    {msg.timestamp}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Thinking Indicator */}
                    {isSending && (
                        <div className="flex gap-3 justify-start items-center">
                            <div className="w-9 h-9 rounded-full bg-[#17111F] border border-[#D4AF72]/50 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(212,175,114,0.25)]">
                                <img src={currentAvatar} alt={currentName} className="w-full h-full object-cover object-top animate-pulse" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-[#17111F]/80 border border-[#D4AF72]/30 text-xs text-[#E8C98A] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#D4AF72] animate-ping"></span>
                                <span>{currentName} is consulting the astral plane...</span>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Sleek Terminal Prompt Bar */}
                <div className="w-full pt-4">
                    <div className="w-full p-2.5 rounded-2xl bg-[#17111F]/85 backdrop-blur-2xl border border-[#D4AF72]/40 shadow-[0_0_30px_rgba(0,0,0,0.6)] flex items-center gap-2.5 focus-within:border-[#D4AF72] focus-within:shadow-[0_0_25px_rgba(212,175,114,0.3)] transition-all">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder={`Transmit query to ${currentName}...`}
                            disabled={isSending}
                            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-gray-400 outline-none resize-none max-h-32 disabled:opacity-50"
                        />

                        {/* Speech Input Button */}
                        <button
                            type="button"
                            onClick={toggleSpeechRecognition}
                            disabled={isSending}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer disabled:opacity-40 ${
                                isListening
                                    ? "bg-red-500/25 border-red-500 text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                    : "bg-white/10 hover:bg-white/15 border-white/20 text-gray-300 hover:text-white"
                            }`}
                            title={isListening ? "Listening... Click to stop" : "Use Voice Input"}
                        >
                            <FiMic size={17} />
                        </button>

                        {/* Send Prompt Button */}
                        <button
                            type="button"
                            onClick={() => handleSendMessage()}
                            disabled={!prompt.trim() || isSending}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] text-black hover:opacity-95 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(212,175,114,0.35)] cursor-pointer font-bold"
                            title="Send Prompt"
                        >
                            <FiSend size={17} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;
