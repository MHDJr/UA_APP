"use client";

import { useCallback, useRef } from "react";

export function useTilt() {
    const ref = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    // Use refs instead of state to avoid re-renders during mouse movement
    const currentTiltRef = useRef({ x: 0, y: 0 });
    const targetTiltRef = useRef({ x: 0, y: 0 });

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || document.hidden || !document.hasFocus()) return;

        const now = performance.now();
        // Throttle updates to 60fps max (every ~16ms)
        if (now - lastUpdateRef.current < 16) return;
        lastUpdateRef.current = now;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate target tilt
        const tiltX = (mouseY / (height / 2)) * 10; // Max 10 degrees tilt
        const tiltY = -(mouseX / (width / 2)) * 10;

        targetTiltRef.current = { x: tiltX, y: tiltY };

        // Smooth interpolation (simple lerp)
        const lerp = 0.3;
        currentTiltRef.current.x +=
            (targetTiltRef.current.x - currentTiltRef.current.x) * lerp;
        currentTiltRef.current.y +=
            (targetTiltRef.current.y - currentTiltRef.current.y) * lerp;

        // Apply transform directly to DOM element (bypasses React render cycle)
        ref.current.style.transform = `perspective(1000px) rotateX(${currentTiltRef.current.x}deg) rotateY(${currentTiltRef.current.y}deg)`;
        ref.current.style.willChange = "transform";
    }, []);

    const onMouseLeave = useCallback(() => {
        if (!ref.current) return;

        // Reset to center with smooth animation
        ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        ref.current.style.transition = "transform 0.3s ease-out";

        // Reset refs
        currentTiltRef.current = { x: 0, y: 0 };
        targetTiltRef.current = { x: 0, y: 0 };

        // Remove transition after animation completes
        setTimeout(() => {
            if (ref.current) {
                ref.current.style.transition = "";
            }
        }, 300);
    }, []);

    return {
        ref,
        style: {
            willChange: "transform",
        },
        onMouseMove,
        onMouseLeave,
    };
}
