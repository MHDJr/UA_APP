// Audio feedback system for Executive OS
let hoverAudio: HTMLAudioElement | null = null;
let clickAudio: HTMLAudioElement | null = null;
let pingAudio: HTMLAudioElement | null = null;

export function initAudioSystem() {
    if (typeof window === "undefined") return;

    // Create audio elements with data URIs for subtle sounds
    hoverAudio = new Audio();
    clickAudio = new Audio();
    pingAudio = new Audio();

    // Subtle hover sound (short beep)
    hoverAudio.volume = 0.1;
    hoverAudio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnl8bllHAU2kdny0HotBSN4yPDekUELFF+16+uoVRQKRp/h8r9sIQUsgs/y2Ik2CBtpvfDknE4MDlCp5fG5ZRwFNpHZ8tB6LQUjeMjw3pFBCxRftevr";

    // Subtle click sound (short pop)
    clickAudio.volume = 0.15;
    clickAudio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnl8bllHAU2kdny0HotBSN4yPDekUELFF+16+uoVRQKRp/h8r9sIQUsgs/y2Ik2CBtpvfDknE4MDlCp5fG5ZRwFNpHZ8tB6LQUjeMjw3pFBCxRftevr";

    // Ping sound for notifications (higher pitch notification ping)
    pingAudio.volume = 0.2;
    pingAudio.src =
        "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f38=";
}

export function playHoverSound() {
    if (hoverAudio) {
        hoverAudio.currentTime = 0;
        hoverAudio.play().catch(() => {});
    }
}

export function playClickSound() {
    if (clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(() => {});
    }
}

export function playPingSound() {
    if (pingAudio) {
        pingAudio.currentTime = 0;
        pingAudio.play().catch(() => {});
    }
}
