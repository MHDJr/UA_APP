"use client";

import { useState } from "react";
import { Plus, X, UserPlus, Lightbulb, FileText, Target, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

// Brand colors
const BRAND_COLORS = {
    orange: "#F14D24",
    orangeLight: "#FF6B35",
    indigo: "#31267D",
};

interface FABAction {
    id: string;
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    color?: string;
}

interface MobileFABProps {
    actions?: FABAction[];
    onMainClick?: () => void;
    variant?: "default" | "staff" | "directive";
}

export function MobileFAB({ actions, onMainClick, variant = "default" }: MobileFABProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { userRole } = useAuth();

    const defaultActions: FABAction[] = [
        {
            id: "assign-task",
            label: "Assign Task",
            icon: Target,
            onClick: () => {
                window.dispatchEvent(new CustomEvent("fab-action", { detail: { action: "new-directive" } }));
            },
            color: BRAND_COLORS.indigo,
        },
        {
            id: "announcements",
            label: "Announcements & Alerts",
            icon: Megaphone,
            onClick: () => {
                window.dispatchEvent(new CustomEvent("fab-action", { detail: { action: "announcement" } }));
            },
            color: BRAND_COLORS.orange,
        },
        ...(userRole === 'CEO' ? [{
            id: "add-staff",
            label: "Add Staff",
            icon: UserPlus,
            onClick: () => {
                window.dispatchEvent(new CustomEvent("fab-action", { detail: { action: "add-staff" } }));
            },
            color: "#10B981",
        }] : []),
    ];

    const currentActions = actions || defaultActions;

    const handleMainClick = () => {
        if (onMainClick) {
            onMainClick();
        } else {
            setIsOpen(!isOpen);
        }
    };

    const handleActionClick = (action: FABAction) => {
        action.onClick();
        setIsOpen(false);
    };

    return (
        <>
            {/* FAB Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Action Buttons */}
                        <div className="fixed bottom-[100px] right-4 z-50 md:hidden flex flex-col items-end gap-3">
                            {currentActions.map((action, index) => (
                                <motion.div
                                    key={action.id}
                                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.05,
                                        ease: "easeOut",
                                    }}
                                    className="flex items-center gap-3"
                                >
                                    {/* Label */}
                                    <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 shadow-lg border border-gray-100">
                                        {action.label}
                                    </span>
                                    
                                    {/* Button */}
                                    <button
                                        onClick={() => handleActionClick(action)}
                                        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90"
                                        style={{
                                            backgroundColor: action.color || BRAND_COLORS.orange,
                                            touchAction: "manipulation",
                                        }}
                                    >
                                        <action.icon className="w-5 h-5 text-white" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                onClick={handleMainClick}
                className={cn(
                    "fixed bottom-[100px] right-4 z-50 md:hidden",
                    "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center",
                    "transition-all duration-300",
                    isOpen ? "rotate-45" : "rotate-0"
                )}
                style={{
                    background: `linear-gradient(135deg, ${BRAND_COLORS.orange} 0%, ${BRAND_COLORS.orangeLight} 100%)`,
                    boxShadow: `0 8px 32px ${BRAND_COLORS.orange}50`,
                    touchAction: "manipulation",
                }}
                whileTap={{ scale: 0.9 }}
            >
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
            </motion.button>
        </>
    );
}

// Specialized FAB variants for specific views
export function StaffFAB({ onAddStaff }: { onAddStaff: () => void }) {
    return (
        <motion.button
            onClick={onAddStaff}
            className="fixed bottom-[100px] right-4 z-50 md:hidden w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300"
            style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                boxShadow: "0 8px 32px rgba(16, 185, 129, 0.4)",
                touchAction: "manipulation",
            }}
            whileTap={{ scale: 0.9 }}
        >
            <UserPlus className="w-6 h-6 text-white" strokeWidth={2} />
        </motion.button>
    );
}

export function DirectiveFAB({ onNewDirective }: { onNewDirective: () => void }) {
    return (
        <motion.button
            onClick={onNewDirective}
            className="fixed bottom-[100px] right-4 z-50 md:hidden w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300"
            style={{
                background: `linear-gradient(135deg, ${BRAND_COLORS.orange} 0%, ${BRAND_COLORS.orangeLight} 100%)`,
                boxShadow: `0 8px 32px ${BRAND_COLORS.orange}50`,
                touchAction: "manipulation",
            }}
            whileTap={{ scale: 0.9 }}
        >
            <Target className="w-6 h-6 text-white" strokeWidth={2} />
        </motion.button>
    );
}

export default MobileFAB;
