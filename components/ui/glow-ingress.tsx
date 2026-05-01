
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface GlowIngressProps {
    isActive: boolean;
    type?: "broadcast" | "summon" | "meeting";
    message?: string;
    onDismiss?: () => void;
}

export function GlowIngress({ isActive, type = "broadcast", message, onDismiss }: GlowIngressProps) {
    const [visible, setVisible] = useState(isActive);

    useEffect(() => {
        setVisible(isActive);
    }, [isActive]);

    const getColors = () => {
        switch (type) {
            case "broadcast": return { border: "border-red-500", glow: "shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]", text: "text-red-500", bg: "bg-red-950/90" };
            case "summon": return { border: "border-emerald-500", glow: "shadow-[inset_0_0_50px_rgba(16,185,129,0.5)]", text: "text-emerald-500", bg: "bg-emerald-950/90" };
            case "meeting": return { border: "border-orange-500", glow: "shadow-[inset_0_0_50px_rgba(249,115,22,0.5)]", text: "text-orange-500", bg: "bg-orange-950/90" };
            default: return { border: "border-red-500", glow: "shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]", text: "text-red-500", bg: "bg-red-950/90" };
        }
    };

    const colors = getColors();

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-start pt-12"
                >
                    {/* Pulsing Borders */}
                    <motion.div 
                        animate={{ 
                            boxShadow: [
                                `inset 0 0 20px 0px ${type === "broadcast" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, 
                                `inset 0 0 60px 10px ${type === "broadcast" ? "rgba(239,68,68,0.6)" : "rgba(16,185,129,0.6)"}`, 
                                `inset 0 0 20px 0px ${type === "broadcast" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`
                            ] 
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute inset-0 border-[8px] ${colors.border}/50`}
                    />

                    {/* Notification Toast */}
                    <motion.div
                        initial={{ y: -100, scale: 0.9 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: -100, scale: 0.9 }}
                        className={`pointer-events-auto relative max-w-lg w-full mx-4 p-1 rounded-xl bg-gradient-to-b ${type === "broadcast" ? "from-red-500/20 to-transparent" : "from-emerald-500/20 to-transparent"} backdrop-blur-md border ${colors.border}/30 shadow-2xl overflow-hidden`}
                    >
                         <div className={`absolute inset-0 ${colors.bg} opacity-90`} />
                         <div className="relative z-10 p-4 flex items-start gap-4">
                            <div className={`p-2 rounded-full bg-black/20 ${colors.text} animate-pulse`}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-lg uppercase tracking-wider ${colors.text} mb-1 flex items-center gap-2`}>
                                    {type === "broadcast" ? "CEO BROADCAST" : "COMMAND CENTER"}
                                </h3>
                                <p className="text-white/90 text-sm leading-relaxed font-medium">
                                    {message}
                                </p>
                            </div>
                            <button 
                                onClick={() => { setVisible(false); onDismiss?.(); }}
                                className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                         </div>
                         
                         {/* Progress bar for auto-dismiss feeling (visual only) */}
                         <motion.div 
                            initial={{ width: "100%" }} 
                            animate={{ width: "0%" }} 
                            transition={{ duration: 10, ease: "linear" }}
                            className={`h-1 ${type === "broadcast" ? "bg-red-500" : "bg-emerald-500"}`}
                         />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
