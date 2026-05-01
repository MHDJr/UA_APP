
"use client";

import { useEffect, useRef } from "react";

interface RealTimePulseProps {
    activityLevel?: number; // 0 to 1, determines wave speed/amplitude
    color?: string;
}

export function RealTimePulse({ activityLevel = 0.5, color = "#00E0FF" }: RealTimePulseProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let p = 0; // Phase

        const render = () => {
            // Resize logic
            const { width, height } = canvas.getBoundingClientRect();
            // Handle high-DPI displays
            const dpr = window.devicePixelRatio || 1;
            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                 canvas.width = width * dpr;
                 canvas.height = height * dpr;
                 ctx.scale(dpr, dpr);
            }

            ctx.clearRect(0, 0, width, height);

            // Wave parameters based on activity
            const speed = 0.05 + (activityLevel * 0.1);
            const amplitude = (height / 4) + (activityLevel * height / 4);
            const frequency = 0.02;

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.lineCap = "round";
            
            // Draw Sine Wave
            for (let x = 0; x < width; x++) {
                const y = (height / 2) + Math.sin(x * frequency + p) * amplitude * Math.sin(p * 0.5); // Modulate amplitude over time too
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Glow effect (simulated by drawing thicker, lower opacity lines behind)
            ctx.beginPath();
            ctx.strokeStyle = color; // transparent version?
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 4;
            for (let x = 0; x < width; x++) {
                 const y = (height / 2) + Math.sin(x * frequency + p) * amplitude * Math.sin(p * 0.5);
                 if (x === 0) ctx.moveTo(x, y);
                 else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;


            p += speed;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [activityLevel, color]);

    return (
        <div className="relative w-full h-16 bg-deep-space/50 rounded-lg overflow-hidden border-[0.5px] border-liquid-silver/20 backdrop-blur-sm">
             {/* Grid overlay */}
             <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />
             <canvas ref={canvasRef} className="w-full h-full" />
             <div className="absolute bottom-1 right-2 text-[10px] font-mono text-electric-cerulean opacity-70">
                 SYSTEM_PULSE_ACTIVE
             </div>
        </div>
    );
}
