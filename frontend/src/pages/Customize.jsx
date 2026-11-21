import { useState, useContext, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import background from "../assets/background.png";
import agent2 from "../assets/agent2.png";
import agent3 from "../assets/agent3.png";
import axios from "axios";
import {
    FiUploadCloud,
    FiStar,
    FiCheck,
    FiArrowRight,
    FiVolume2,
    FiVolumeX,
} from "react-icons/fi";
import {
    speakCelestialResponse,
    stopCelestialSpeech,
} from "../utils/speechVoice";

const PRESET_AVATARS = [
    {
        id: "elara",
        name: "Elara",
        gender: "female",
        tagline: "Creative Synthesis & Intuitive Strategy",
        image: agent2,
    },
    {
        id: "orion",
        name: "Orion",
        gender: "male",
        tagline: "Tactical Navigator & Deep Analytical Power",
        image: agent3,
    },
];

function Customize() {
    const { userData, setUserData, serverUrl, authLoading } = useContext(UserDataContext);
    
    // Mode: "preset" or "custom"
    const [selectedMode, setSelectedMode] = useState(
        userData?.assistantImage && !PRESET_AVATARS.some((p) => p.image === userData?.assistantImage || p.name === userData?.assistantName)
            ? "custom"
            : "preset"
    );

    // Initial preset selection
    const initialPreset = PRESET_AVATARS.find((p) => p.name === userData?.assistantName) || PRESET_AVATARS[0];
    const [selectedPresetId, setSelectedPresetId] = useState(initialPreset.id);

    // Custom upload state
    const [customName, setCustomName] = useState(
        selectedMode === "custom" ? (userData?.assistantName || "") : ""
    );
    const [customGender, setCustomGender] = useState(
        userData?.assistantGender || "female"
    );
    const [customImageFile, setCustomImageFile] = useState(null);
    const [customImagePreview, setCustomImagePreview] = useState(
        selectedMode === "custom" ? (userData?.assistantImage || "") : ""
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [previewPlayingId, setPreviewPlayingId] = useState(null);
    const navigate = useNavigate();

    // Clean up any ongoing preview speech when leaving the page
    useEffect(() => {
        return () => {
            stopCelestialSpeech();
        };
    }, []);

    const handlePreviewVoice = (gender, personaName) => {
        if (previewPlayingId === personaName) {
            stopCelestialSpeech();
            setPreviewPlayingId(null);
            return;
        }

        setPreviewPlayingId(personaName);
        const greeting =
            gender === "female"
                ? `Greetings! I am ${personaName}. My voice is clear, sweet, and tuned to guide you.`
                : `Greetings. I am ${personaName}. My voice is steady, analytical, and ready for navigation.`;

        speakCelestialResponse(greeting, {
            targetGender: gender,
            assistantName: personaName,
            onStart: () => setPreviewPlayingId(personaName),
            onEnd: () => setPreviewPlayingId(null),
            onError: () => setPreviewPlayingId(null),
        });
    };

    if (authLoading) {
        return (
            <div
                className="w-full min-h-screen min-h-dvh bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${background})` }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#D4AF72] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-[#E8C98A] tracking-wider font-medium">Loading Celestial Hall...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return <Navigate to="/signin" replace />;
    }

    // Active details for Live Preview & Submission
    const activePreset = PRESET_AVATARS.find((p) => p.id === selectedPresetId) || PRESET_AVATARS[0];
    const activePreviewImage = selectedMode === "preset" ? activePreset.image : (customImagePreview || null);
    const activePreviewName = selectedMode === "preset" ? activePreset.name : (customName.trim() || "Your Custom Persona");
    const activePreviewTagline = selectedMode === "preset" ? activePreset.tagline : "Personalized Avatar & Custom Identity";

    const handleSelectPreset = (preset) => {
        setSelectedMode("preset");
        setSelectedPresetId(preset.id);
        if (error) setError("");
    };

    const handleSelectCustomMode = () => {
        setSelectedMode("custom");
        if (error) setError("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedMode("custom");
            setCustomImageFile(file);
            setCustomImagePreview(URL.createObjectURL(file));
            if (error) setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (selectedMode === "preset") {
            if (!activePreset) {
                setError("Please select one of the four preset avatars.");
                return;
            }
        } else {
            if (!customName.trim()) {
                setError("Please enter an assistant name for your custom persona.");
                return;
            }
            if (customName.trim().length < 2) {
                setError("Assistant name must be at least 2 characters.");
                return;
            }
            if (!customImageFile && !customImagePreview) {
                setError("Please upload an image for your custom persona.");
                return;
            }
        }

        setLoading(true);

        try {
            const formData = new FormData();

            if (selectedMode === "preset") {
                formData.append("assistantName", activePreset.name);
                formData.append("assistantImage", activePreset.image);
                formData.append("assistantGender", activePreset.gender);
            } else {
                formData.append("assistantName", customName.trim());
                formData.append("assistantGender", customGender);
                if (customImageFile) {
                    formData.append("assistantImage", customImageFile);
                } else if (customImagePreview) {
                    formData.append("assistantImage", customImagePreview);
                }
            }

            const res = await axios.post(`${serverUrl}/api/user/update-assistant`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (res.data?.user) {
                setUserData(res.data.user);
            }
            navigate("/");
        } catch (err) {
            console.error("Customize error:", err);
            setError(err.response?.data?.message || "Failed to customize assistant. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full min-h-screen min-h-dvh bg-cover bg-center bg-fixed flex flex-col justify-between p-4 sm:p-6 lg:p-10 text-white"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="w-full max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF72]/20 border border-[#D4AF72]/40 text-[#E8C98A] text-xs font-semibold tracking-wider uppercase">
                        <FiStar size={13} />
                        <span>Persona Customization</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-widest text-[#E8C98A] drop-shadow-[0_4px_16px_rgba(232,201,138,0.25)]">
                        CHOOSE YOUR COMPANION
                    </h1>
                    <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
                        Select one of Astra’s four celestial archetypes or forge a unique custom persona.
                    </p>
                </div>

                {error && (
                    <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center shadow-lg backdrop-blur-md">
                        {error}
                    </div>
                )}

                {/* Main Live Preview Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#17111F]/85 border border-[#D4AF72]/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-center gap-5 sm:gap-7 transition-all">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#D4AF72] shadow-[0_0_25px_rgba(212,175,114,0.4)] flex-shrink-0 bg-black/50">
                        {activePreviewImage ? (
                            <img
                                src={activePreviewImage}
                                alt={activePreviewName}
                                className="w-full h-full object-cover object-top"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#D4AF72]/50 text-xs text-center p-2">
                                No image selected
                            </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/75 border border-[#D4AF72]/50 text-[10px] font-bold text-[#E8C98A]">
                            LIVE
                        </span>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-[#D4AF72]/20 text-[#E8C98A] border border-[#D4AF72]/30 mb-1">
                            {selectedMode === "preset" ? "Celestial Preset" : "Custom Persona"}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#E8C98A] tracking-wide">
                            {activePreviewName}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg">
                            {activePreviewTagline}
                        </p>
                        <p className="text-[11px] text-[#D4AF72]/80 italic pt-1">
                            {selectedMode === "preset"
                                ? "Preset name is fixed and tuned for this persona."
                                : "Custom persona name and avatar are editable below."}
                        </p>
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#E8C98A]">
                        Select from 4 Preset Avatars
                    </h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF72]/40 to-transparent"></div>
                </div>

                {/* 2×2 Grid of Large Rounded-Rectangle Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    {PRESET_AVATARS.map((preset) => {
                        const isSelected = selectedMode === "preset" && selectedPresetId === preset.id;
                        return (
                            <div
                                key={preset.id}
                                onClick={() => handleSelectPreset(preset)}
                                className={`
                                    group cursor-pointer rounded-2xl p-4 sm:p-5
                                    transition-all duration-300 flex flex-col justify-between
                                    backdrop-blur-xl relative overflow-hidden
                                    ${
                                        isSelected
                                            ? "bg-[#17111F]/95 border-2 border-[#D4AF72] shadow-[0_0_30px_rgba(212,175,114,0.45)] ring-1 ring-[#E8C98A]/60 scale-[1.01]"
                                            : "bg-[#17111F]/70 border border-[#D4AF72]/25 opacity-85 hover:opacity-100 hover:border-[#D4AF72]/60 hover:shadow-xl hover:scale-[1.005]"
                                    }
                                `}
                            >
                                {/* Selection Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                            isSelected
                                                ? "bg-[#D4AF72] text-black shadow-md shadow-[#D4AF72]/50 font-bold"
                                                : "bg-black/50 border border-white/20 text-transparent"
                                        }`}
                                    >
                                        <FiCheck size={14} className={isSelected ? "text-black" : "opacity-0"} />
                                    </div>
                                </div>

                                {/* Large Image (180–220px tall on desktop) */}
                                <div className="w-full h-48 sm:h-52 md:h-56 rounded-xl overflow-hidden bg-black/40 border border-white/10 relative">
                                    <img
                                        src={preset.image}
                                        alt={preset.name}
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#17111F] via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Card Text Content */}
                                <div className="pt-3.5 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg sm:text-xl font-bold text-[#E8C98A] tracking-wide">
                                            {preset.name}
                                        </h4>
                                        <span className="text-[10px] text-[#D4AF72] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#D4AF72]/15 border border-[#D4AF72]/30">
                                            {preset.gender === "male" ? "♂ Male Voice" : "♀ Female Voice"}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                                        {preset.tagline}
                                    </p>

                                    {/* Interactive Voice Preview Button */}
                                    <div className="pt-2 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreviewVoice(preset.gender, preset.name);
                                            }}
                                            className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full border transition-all font-semibold cursor-pointer shadow-sm active:scale-95 ${
                                                previewPlayingId === preset.name
                                                    ? "bg-[#D4AF72] text-black border-[#D4AF72] animate-pulse"
                                                    : "bg-[#D4AF72]/15 text-[#E8C98A] border-[#D4AF72]/30 hover:bg-[#D4AF72]/25"
                                            }`}
                                        >
                                            {previewPlayingId === preset.name ? (
                                                <>
                                                    <FiVolumeX size={12} />
                                                    <span>Stop Audio</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiVolume2 size={12} />
                                                    <span>Hear Voice</span>
                                                </>
                                            )}
                                        </button>
                                        <span className="text-[10px] text-gray-400 italic">
                                            {preset.gender === "female" ? "Crisp & Sweet" : "Steady & Grounded"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section Title for Custom Persona */}
                <div className="flex items-center gap-3 pt-2">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#E8C98A]">
                        Or Create a Custom Persona
                    </h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF72]/40 to-transparent"></div>
                </div>

                {/* Matching Rounded-Rectangle Card for Custom Upload */}
                <div
                    onClick={handleSelectCustomMode}
                    className={`
                        rounded-2xl p-5 sm:p-6 transition-all duration-300
                        backdrop-blur-xl relative cursor-pointer
                        ${
                            selectedMode === "custom"
                                ? "bg-[#17111F]/95 border-2 border-[#D4AF72] shadow-[0_0_30px_rgba(212,175,114,0.45)] ring-1 ring-[#E8C98A]/60"
                                : "bg-[#17111F]/70 border border-[#D4AF72]/25 opacity-85 hover:opacity-100 hover:border-[#D4AF72]/60"
                        }
                    `}
                >
                    {/* Custom Selection Badge */}
                    <div className="absolute top-5 right-5 z-10">
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                selectedMode === "custom"
                                    ? "bg-[#D4AF72] text-black shadow-md shadow-[#D4AF72]/50 font-bold"
                                    : "bg-black/50 border border-white/20 text-transparent"
                            }`}
                        >
                            <FiCheck size={14} className={selectedMode === "custom" ? "text-black" : "opacity-0"} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        {/* Custom Image Upload Zone (matching 180-220px height) */}
                        <div>
                            <label className="w-full h-48 sm:h-52 rounded-xl border-2 border-dashed border-[#D4AF72]/50 hover:border-[#D4AF72] bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group">
                                {customImagePreview ? (
                                    <>
                                        <img
                                            src={customImagePreview}
                                            alt="Custom Preview"
                                            className="w-full h-full object-cover object-top"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity text-[#E8C98A] text-xs font-medium">
                                            <FiUploadCloud size={20} />
                                            <span>Click to Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#D4AF72]/20 border border-[#D4AF72]/40 flex items-center justify-center text-[#E8C98A]">
                                            <FiUploadCloud size={24} />
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-[#E8C98A]">
                                            Upload Your Custom Avatar
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            PNG, JPG or WebP (Cloudinary cloud storage)
                                        </span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Custom Name & Details */}
                        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#D4AF72]/20 text-[#E8C98A] border border-[#D4AF72]/30 mb-1.5">
                                    Custom Identity
                                </span>
                                <h4 className="text-lg sm:text-xl font-bold text-[#E8C98A]">
                                    Forge a Personalized Persona
                                </h4>
                                <p className="text-xs text-gray-300 leading-relaxed mt-1">
                                    Upload your own artwork, avatar, or portrait and enter the custom name your assistant will respond to.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#E8C98A] mb-1.5">
                                    Custom Assistant Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customName}
                                    onFocus={() => setSelectedMode("custom")}
                                    onChange={(e) => {
                                        setSelectedMode("custom");
                                        setCustomName(e.target.value);
                                        if (error) setError("");
                                    }}
                                    placeholder="e.g. Jarvis, Friday, Athena, Neo"
                                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-gray-400 text-sm outline-none transition-all ${
                                        selectedMode === "custom"
                                            ? "border-[#D4AF72] focus:ring-1 focus:ring-[#D4AF72]"
                                            : "border-white/20 hover:border-white/40"
                                    }`}
                                />
                            </div>

                            {/* Voice Profile Selector for Custom Persona */}
                            <div>
                                <label className="block text-xs font-medium text-[#E8C98A] mb-1.5">
                                    Voice Gender Profile <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedMode("custom");
                                            setCustomGender("female");
                                        }}
                                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                                            customGender === "female"
                                                ? "bg-[#D4AF72] border-[#D4AF72] text-black shadow-[0_0_15px_rgba(212,175,114,0.4)]"
                                                : "bg-white/5 border-white/15 text-gray-300 hover:border-[#D4AF72]/40 hover:bg-white/10"
                                        }`}
                                    >
                                        <span>♀ Female Voice</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedMode("custom");
                                            setCustomGender("male");
                                        }}
                                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                                            customGender === "male"
                                                ? "bg-[#D4AF72] border-[#D4AF72] text-black shadow-[0_0_15px_rgba(212,175,114,0.4)]"
                                                : "bg-white/5 border-white/15 text-gray-300 hover:border-[#D4AF72]/40 hover:bg-white/10"
                                        }`}
                                    >
                                        <span>♂ Male Voice</span>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handlePreviewVoice(customGender, customName.trim() || "Custom Persona")}
                                        className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full border transition-all font-semibold cursor-pointer shadow-sm active:scale-95 ${
                                            previewPlayingId === (customName.trim() || "Custom Persona")
                                                ? "bg-[#D4AF72] text-black border-[#D4AF72] animate-pulse"
                                                : "bg-[#D4AF72]/15 text-[#E8C98A] border-[#D4AF72]/30 hover:bg-[#D4AF72]/25"
                                        }`}
                                    >
                                        {previewPlayingId === (customName.trim() || "Custom Persona") ? (
                                            <>
                                                <FiVolumeX size={12} />
                                                <span>Stop Audio</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiVolume2 size={12} />
                                                <span>Test {customGender === "female" ? "Female Voice (Elara Style)" : "Male Voice (Orion Style)"}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Associates this custom assistant with a dedicated {customGender} vocal synthesizer profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Launch Button */}
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full max-w-md mx-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF72] via-[#E8C98A] to-[#D4AF72] text-black font-extrabold text-sm sm:text-base tracking-widest hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_4px_25px_rgba(212,175,114,0.35)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving to Profile...</span>
                            </>
                        ) : (
                            <>
                                <span>Launch with {activePreviewName}</span>
                                <FiArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Customize;
