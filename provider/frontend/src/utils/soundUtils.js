/**
 * Notification and Interaction Sounds (Provider Platform)
 * 
 * Centralized audio management for the expert dashboard.
 * Uses localStorage to persist user preferences across sessions.
 */

const SOUND_MAP = {
    default: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", // Standard Alert
    chime: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",   // Crystal Chime
    digital: "https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3", // Digital Pulse
    retro: "https://assets.mixkit.co/active_storage/sfx/1041/1041-preview.mp3"    // Retro Ping
};

class SoundManager {
    constructor() {
        this.fallbackSound = SOUND_MAP.default;
    }

    /**
     * Retrieves the preferred sound URL based on provider settings
     */
    getNotifSoundUrl() {
        // Provider specific key to avoid conflicts if sharing localhost
        const preferredId = localStorage.getItem("providerNotificationSound") || "default";
        return SOUND_MAP[preferredId] || this.fallbackSound;
    }

    /**
     * Plays the notification sound
     */
    playNotification() {
        try {
            const soundUrl = this.getNotifSoundUrl();
            const audio = new Audio(soundUrl);
            audio.play().catch(e => console.warn("Audio playback blocked by browser policies. Interaction required."));
        } catch (err) {
            console.error("Provider Sound Manager Error:", err);
        }
    }

    /**
     * Prime the audio context
     */
    prime() {
        const audio = new Audio();
        audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
        audio.play().catch(() => {});
    }
}

export const soundManager = new SoundManager();
