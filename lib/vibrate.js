export function vibratePattern() {
    if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
    ) {
        try {
            navigator.vibrate([200, 100, 200]);
        } catch (e) {
            // ignore
        }
    }
}
