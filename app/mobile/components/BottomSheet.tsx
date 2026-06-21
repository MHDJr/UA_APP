"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    className,
}: BottomSheetProps) {
    // Lock background scroll when the sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark translucent backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sliding Drawer Card */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 280 }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-[100] max-h-[92vh] flex flex-col",
                            "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl rounded-t-[2rem] border-t border-slate-200/50 dark:border-zinc-800/50",
                            "shadow-[0_-15px_40px_rgba(0,0,0,0.15)] overflow-hidden",
                            className
                        )}
                    >
                        {/* Drag Handle Indicator */}
                        <div className="flex justify-center py-3 flex-shrink-0">
                            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-800" />
                        </div>

                        {/* Header Section */}
                        <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100 dark:border-zinc-800/40 flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                                    {title}
                                </h3>
                                <p className="text-[10px] text-[#31267D] dark:text-purple-400 font-black uppercase tracking-widest mt-0.5">
                                    Command Action Sheet
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 active:scale-90 transition-all border border-slate-200/30 dark:border-zinc-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Content View */}
                        <div className="flex-1 overflow-y-auto p-6 pb-[calc(2rem+env(safe-area-inset-bottom,20px))]">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default BottomSheet;
