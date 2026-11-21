import background from "../assets/background.png";

/**
 * Responsive Procedural Celestial Background
 * Dynamically adapts the obsidian-and-gold aesthetic of background.png across
 * Mobile, Tablet, Laptop, and Ultrawide viewports.
 *
 * @param {"dashboard" | "auth" | "customize"} variant - Layout-specific atmospheric lighting
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Optional wrapped children
 */
export default function CelestialBackground({
    variant = "dashboard",
    className = "",
    children,
}) {
    return (
        <div
            className={`relative w-full overflow-hidden select-none bg-[#07050B] ${className}`}
        >
            {/* 1. LAYER 0: Interstellar Deep Space Mesh (Zero-latency Pure CSS) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#06040A] via-[#0E0919] to-[#07040D] pointer-events-none z-0" />

            {/* 2. LAYER 1: Multi-Point Radiant Celestial Nebulas */}
            {variant === "auth" && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {/* Centered Golden Solar Portal (Frames Auth Card) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] md:w-[650px] h-[340px] sm:h-[500px] md:h-[650px] rounded-full bg-gradient-to-tr from-[#D4AF72]/25 via-[#E8C98A]/15 to-transparent blur-3xl animate-nebula-pulse" />

                    {/* Top-Left Mystic Nebula Bloom */}
                    <div className="absolute -top-24 -left-24 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-purple-900/20 blur-3xl" />

                    {/* Bottom-Right Warm Amber Stellar Dust */}
                    <div className="absolute -bottom-24 -right-24 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-[#D4AF72]/15 blur-3xl" />

                    {/* Concentric Golden Orbital Rings Framing the Portal */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[620px] h-[420px] sm:h-[620px] rounded-full border border-[#D4AF72]/10 pointer-events-none animate-orbit-slow" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full border border-dashed border-[#E8C98A]/15 pointer-events-none animate-orbit-reverse" />
                </div>
            )}

            {variant === "dashboard" && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {/* Stage-Centered Radiant Golden Core Bloom */}
                    {/* Centers on avatar orb: slightly right on desktop (compensating for sidebar dock), dead center on mobile */}
                    <div className="absolute top-[42%] lg:top-[44%] left-1/2 lg:left-[58%] -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[460px] md:w-[600px] lg:w-[720px] h-[320px] sm:h-[460px] md:h-[600px] lg:h-[720px] rounded-full bg-gradient-to-tr from-[#D4AF72]/30 via-[#E8C98A]/18 to-transparent blur-3xl animate-nebula-pulse" />

                    {/* Left Dock Deepening Shade (Ensures Sidebar Contrast) */}
                    <div className="hidden lg:block absolute top-0 left-0 bottom-0 w-96 bg-gradient-to-r from-[#050308]/90 via-[#07050D]/60 to-transparent z-0" />

                    {/* Top-Right Cosmic Violet Cloud */}
                    <div className="absolute -top-32 right-[-10%] w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] rounded-full bg-purple-950/30 blur-3xl" />

                    {/* Bottom Ground Cosmic Horizon Beam (Anchors Bottom Pedestal & Waveform) */}
                    <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 bg-gradient-to-t from-[#1A1208]/80 via-[#D4AF72]/10 to-transparent z-0" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-24 sm:h-32 rounded-t-[100%] bg-gradient-to-t from-[#E8C98A]/15 to-transparent blur-2xl z-0" />
                </div>
            )}

            {variant === "customize" && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {/* Expansive Ambient Golden Nebula Flow */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[450px] rounded-full bg-gradient-to-b from-[#D4AF72]/20 via-[#E8C98A]/10 to-transparent blur-3xl animate-nebula-pulse" />

                    {/* Mid-Canvas Violet Nebular Ribbon */}
                    <div className="absolute top-1/2 -left-20 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-purple-950/25 blur-3xl" />
                    <div className="absolute bottom-20 -right-20 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-[#D4AF72]/15 blur-3xl" />

                    {/* Subtle Base Horizon */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#140E05]/60 to-transparent" />
                </div>
            )}

            {/* 3. LAYER 2: Procedural Responsive SVG Starfield */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-[1] opacity-75"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFF7E0" stopOpacity="1" />
                        <stop offset="60%" stopColor="#E8C98A" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#D4AF72" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Staggered Twinkling Star Layer 1 */}
                <g className="animate-twinkle-slow">
                    <circle cx="8%" cy="14%" r="1" fill="#FFF7E0" opacity="0.85" />
                    <circle cx="16%" cy="32%" r="1.5" fill="#E8C98A" opacity="0.9" />
                    <circle cx="28%" cy="18%" r="1" fill="#FFF" opacity="0.75" />
                    <circle cx="34%" cy="65%" r="2" fill="url(#star-glow)" opacity="0.9" />
                    <circle cx="48%" cy="12%" r="1" fill="#E8C98A" opacity="0.8" />
                    <circle cx="62%" cy="24%" r="1.5" fill="#FFF" opacity="0.85" />
                    <circle cx="74%" cy="15%" r="2" fill="url(#star-glow)" opacity="0.95" />
                    <circle cx="82%" cy="38%" r="1" fill="#E8C98A" opacity="0.75" />
                    <circle cx="91%" cy="22%" r="1.5" fill="#FFF" opacity="0.85" />
                    <circle cx="94%" cy="68%" r="1" fill="#E8C98A" opacity="0.8" />
                    <circle cx="22%" cy="84%" r="1.5" fill="#FFF" opacity="0.75" />
                    <circle cx="78%" cy="78%" r="1.5" fill="#E8C98A" opacity="0.85" />
                </g>

                {/* Staggered Twinkling Star Layer 2 */}
                <g className="animate-twinkle-fast">
                    <circle cx="5%" cy="48%" r="1.2" fill="#E8C98A" opacity="0.75" />
                    <circle cx="12%" cy="75%" r="1" fill="#FFF" opacity="0.8" />
                    <circle cx="24%" cy="42%" r="1.8" fill="url(#star-glow)" opacity="0.9" />
                    <circle cx="42%" cy="28%" r="1" fill="#E8C98A" opacity="0.8" />
                    <circle cx="54%" cy="72%" r="1.2" fill="#FFF" opacity="0.7" />
                    <circle cx="68%" cy="56%" r="1.8" fill="url(#star-glow)" opacity="0.95" />
                    <circle cx="79%" cy="44%" r="1" fill="#FFF" opacity="0.85" />
                    <circle cx="86%" cy="82%" r="1.5" fill="#E8C98A" opacity="0.8" />
                    <circle cx="95%" cy="45%" r="1.2" fill="#FFF" opacity="0.75" />
                    <circle cx="38%" cy="88%" r="1" fill="#E8C98A" opacity="0.85" />
                </g>

                {/* Sparkling Cross Stars (✦) */}
                <g opacity="0.75" className="animate-twinkle-slow">
                    <path
                        d="M 180 80 Q 185 85 190 85 Q 185 85 180 90 Q 185 85 180 80 Z"
                        fill="#E8C98A"
                        transform="scale(0.8) translate(15, 20)"
                    />
                    <path
                        d="M 180 80 Q 185 85 190 85 Q 185 85 180 90 Q 185 85 180 80 Z"
                        fill="#FFF0C8"
                        transform="scale(1.1) translate(400, 40)"
                    />
                    <path
                        d="M 180 80 Q 185 85 190 85 Q 185 85 180 90 Q 185 85 180 80 Z"
                        fill="#E8C98A"
                        transform="scale(0.9) translate(750, 80)"
                    />
                </g>
            </svg>

            {/* 4. LAYER 3: Subtle Organic Texture Overlay (Blended at low opacity) */}
            {/* Preserves the authentic painterly celestial horizon from background.png without blocking or distortion */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-[2] opacity-20 mix-blend-screen"
                style={{ backgroundImage: `url(${background})` }}
            />

            {/* 5. Content Canvas Slot */}
            <div className="relative z-10 w-full h-full">{children}</div>
        </div>
    );
}

