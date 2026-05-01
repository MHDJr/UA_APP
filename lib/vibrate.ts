
export const vibratePattern = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        // SOS Pattern or similar distinctive buzz
        navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
    }
};
