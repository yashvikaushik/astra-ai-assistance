/**
 * Celestial Voice Engine for Astra AI Assistant
 * Strictly enforces Sweet, Crisp, Clear Female voices for Elara and female personas,
 * and standard steady male voices for Orion and male personas.
 */

export const VERIFIED_FEMALE_VOICES = [
    // 1. Apple macOS / iOS Pristine Natural Female Voices
   
    "Victoria", // macOS sweet, refined British female
    "Karen", // macOS Australian crisp female
    "Moira", // macOS Irish sweet female
    "Tessa", // macOS clear female
    "Kathy", // macOS American female
    "Serena", // Apple UK female
    "Ava", // macOS modern enhanced female
    "Allison", // macOS American female
    "Susan", // macOS American female
    "Zoe", // macOS American female
    "Veena", // macOS Indian English female

    // 2. Google Chrome Female Voices
    "Google UK English Female", // Chrome's clear, elegant British female voice

    // 3. Microsoft Windows / Edge Natural Voices
    "Microsoft Jenny Online (Natural) - English (United States)",
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Sonia Online (Natural) - English (United Kingdom)",
    "Microsoft Libby Online (Natural) - English (United Kingdom)",
    "Microsoft Zira - English (United States)",
    "Microsoft Zira Desktop - English (United States)",
];

export const VERIFIED_MALE_VOICES = [
    // 1. Google Chrome Male Voices
    "Google US English", // Chrome's standard American male voice
    "Google UK English Male", // Chrome UK male voice

    // 2. macOS / iOS Male Voices
    "Daniel", // macOS standard crisp British male
    "Alex", // macOS classic American male
    "Fred", // macOS male
    "George", // macOS male
    "Oliver", // macOS male

    // 3. Microsoft Windows / Edge Male Voices
    "Microsoft David - English (United States)",
    "Microsoft David Desktop - English (United States)",
    "Microsoft Guy Online (Natural)",
    "David",
];

// Strict blacklist to guarantee female personas NEVER receive a male or novelty voice
export const STRICT_MALE_BLACKLIST =
    /google us english|alex|daniel|david|fred|albert|george|oliver|ralph|rishi|thomas|tom|mark|guy|richard|james|male|man\b|boy|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|junior|organ|superstar|trinoids|whisper|wobble|zarvox/i;

/**
 * Returns available speech synthesis voices from the browser
 */
export function getAvailableVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return [];
    }
    return window.speechSynthesis.getVoices() || [];
}

/**
 * Finds the optimal voice for the given gender ("female" | "male")
 */


export function getVoiceForGender(targetGender = "female", voiceList = null) {
    const voices = voiceList?.length
        ? voiceList
        : getAvailableVoices();

    if (!voices.length) return null;

    const preferredVoiceName =
        targetGender === "female" ? "Karen" : "Daniel";

    const selectedVoice = voices.find(
        (voice) => voice.name === preferredVoiceName
    );

    if (!selectedVoice) {
        console.warn(
            `Preferred voice ${preferredVoiceName} is unavailable.`
        );
        return null;
    }

    return selectedVoice;
}



/**
 * Speaks the given text with calibrated pitch and timing for the target gender
 */
export function speakCelestialResponse(text, options = {}) {
    const {
        targetGender = "female",
        assistantName = "Elara",
        onStart = () => {},
        onEnd = () => {},
        onError = () => {},
        retryCount = 0,
    } = options;

    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
        return;
    }

    try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const voices = getAvailableVoices();

        // If voices array is still empty (Chrome async loading race condition), retry briefly
        if (voices.length === 0 && retryCount < 3) {
            setTimeout(() => {
                speakCelestialResponse(text, {
                    ...options,
                    retryCount: retryCount + 1,
                });
            }, 150);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = getVoiceForGender(targetGender, voices);
        
        console.log("ASSISTANT NAME:", assistantName);
console.log("TARGET GENDER:", targetGender);
console.log("SELECTED VOICE:", selectedVoice?.name);
console.log("AVAILABLE SAMANTHA:", voices.some(v => v.name === "Samantha"));
console.log("AVAILABLE DANIEL:", voices.some(v => v.name === "Daniel"));

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang || "en-US";
            console.log(
                `🎙️ [Voice Synthesis] Speaking as "${assistantName}" (${targetGender}) | Voice: "${selectedVoice.name}" (${selectedVoice.lang})`
            );
        } else {
            utterance.lang = "en-US";
            console.warn(
                `⚠️ [Voice Synthesis] No voice match found. Defaulting for "${assistantName}" (${targetGender})`
            );
        }

        // Calibrated vocal acoustics:
        // Female (Elara): Crisp, sweet, clear, melodic (pitch 1.15, rate 1.0)
        // Male (Orion): Grounded, steady, analytical (pitch 0.92, rate 1.0)
        if (targetGender === "female") {
            utterance.pitch = 1.15;
            utterance.rate = 1.0;
        } else {
            utterance.pitch = 0.92;
            utterance.rate = 1.0;
        }

        utterance.onstart = () => {
            onStart();
        };

        utterance.onend = () => {
            onEnd();
        };

        utterance.onerror = (e) => {
            console.warn("Speech synthesis utterance error:", e);
            onError(e);
        };

        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.error("Speech synthesis failed:", err);
        onError(err);
    }
}

/**
 * Cancels any ongoing speech synthesis immediately
 */
export function stopCelestialSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}

