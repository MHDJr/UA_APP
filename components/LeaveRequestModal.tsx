"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ChevronLeft,
    Send,
    Stethoscope,
    Coffee,
    LogOut,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Clock,
    FileText,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { format } from "date-fns";

// =====================================================
// BRAND COLORS
// =====================================================
const BRAND = {
    indigo: "#31267D",
    orange: "#F14D24",
    lightIndigo: "#4A3B9A",
    softOrange: "#FFF5F2",
    glassBg: "rgba(255, 255, 255, 0.9)",
    glassBorder: "rgba(49, 38, 125, 0.15)",
};

// =====================================================
// TYPES
// =====================================================
type LeaveType = "medical" | "casual" | "early" | "emergency";

interface LeaveTypeConfig {
    id: LeaveType;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    glowColor?: string;
}

interface LeaveFormData {
    type: LeaveType;
    startDate: string;
    endDate: string;
    departureTime: string;
    reason: string;
}

// =====================================================
// LEAVE TYPE CONFIGURATION
// =====================================================
const LEAVE_TYPES: LeaveTypeConfig[] = [
    {
        id: "medical",
        label: "Medical Leave",
        description: "Health-related time off with documentation",
        icon: Stethoscope,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
    },
    {
        id: "casual",
        label: "Casual Leave",
        description: "Personal time off for rest and relaxation",
        icon: Coffee,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    {
        id: "early",
        label: "Early Leave",
        description: "Leave before scheduled end time",
        icon: LogOut,
        color: "text-[#F14D24]",
        bgColor: "bg-[#FFF5F2]",
        glowColor: "#F14D24",
    },
    {
        id: "emergency",
        label: "Emergency",
        description: "Urgent personal or family matters",
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50",
    },
];

// =====================================================
// ANIMATION VARIANTS
// =====================================================
const scaleIn = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
};

const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const validateForm = (data: LeaveFormData): boolean => {
    if (!data.type) return false;
    if (!data.reason.trim()) return false;
    
    if (data.type === "early") {
        return data.departureTime.trim() !== "";
    } else {
        return data.startDate.trim() !== "" && data.endDate.trim() !== "";
    }
};

// =====================================================
// LEAVE TYPE SELECTION STEP
// =====================================================
const TypeSelectionStep: React.FC<{
    selectedType: LeaveType | null;
    onSelect: (type: LeaveType) => void;
}> = ({ selectedType, onSelect }) => {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-5"
        >
            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#31267D]/10 mb-4"
                >
                    <Calendar className="w-4 h-4 text-[#31267D]" />
                    <span className="text-xs font-bold text-[#31267D] uppercase tracking-wider">
                        Select Leave Type
                    </span>
                </motion.div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">
                    What type of leave do you need?
                </h4>
                <p className="text-sm text-slate-500">
                    Choose the option that best fits your situation
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {LEAVE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    const isEarly = type.id === "early";

                    return (
                        <motion.button
                            key={type.id}
                            variants={fadeInUp}
                            onClick={() => onSelect(type.id)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative p-5 rounded-2xl border-2 text-left transition-all duration-300",
                                "hover:shadow-lg",
                                isSelected
                                    ? "border-[#31267D] bg-[#31267D]/5 shadow-lg"
                                    : "border-slate-200 bg-white/80 hover:border-[#31267D]/30"
                            )}
                        >
                            {/* Glow effect for Early Leave when selected */}
                            {isEarly && isSelected && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 rounded-2xl"
                                    style={{
                                        boxShadow: `0 0 30px 5px ${BRAND.orange}40`,
                                        pointerEvents: "none",
                                    }}
                                />
                            )}

                            {isSelected && (
                                <motion.div
                                    layoutId="leaveSelectedIndicator"
                                    className="absolute top-3 right-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#31267D] flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                </motion.div>
                            )}

                            <div
                                className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                                    type.bgColor,
                                    isEarly && isSelected && "ring-2 ring-[#F14D24] ring-offset-2"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-6 h-6 transition-all duration-300",
                                        type.color,
                                        isEarly && isSelected && "scale-110"
                                    )}
                                />
                            </div>

                            <h3 className="font-bold text-slate-900 text-sm mb-1">
                                {type.label}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {type.description}
                            </p>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

// =====================================================
// FORM STEP
// =====================================================
const FormStep: React.FC<{
    data: LeaveFormData;
    onChange: (data: LeaveFormData) => void;
}> = ({ data, onChange }) => {
    const selectedType = LEAVE_TYPES.find((t) => t.id === data.type);
    const Icon = selectedType?.icon || Calendar;

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
                        selectedType?.bgColor
                    )}
                >
                    <Icon className={cn("w-4 h-4", selectedType?.color)} />
                    <span className={cn("text-xs font-bold uppercase tracking-wider", selectedType?.color)}>
                        {selectedType?.label}
                    </span>
                </motion.div>
                <p className="text-sm text-slate-500">
                    Fill in the details for your leave request
                </p>
            </div>

            {/* Smart Inputs based on Leave Type */}
            {data.type === "early" ? (
                // Early Leave: Time Picker
                <motion.div variants={fadeInUp} className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                        Departure Time <span className="text-[#F14D24]">*</span>
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F14D24]" />
                        <input
                            type="time"
                            value={data.departureTime}
                            onChange={(e) => onChange({ ...data, departureTime: e.target.value })}
                            className={cn(
                                "w-full pl-12 pr-4 py-4 bg-white/80 border-2 rounded-xl",
                                "focus:ring-0 focus:border-[#F14D24] outline-none",
                                "text-sm font-semibold text-slate-900",
                                "transition-all duration-200",
                                "placeholder:text-slate-400"
                            )}
                        />
                    </div>
                    <p className="text-xs text-slate-500 ml-1">
                        Select the time you plan to leave today
                    </p>
                </motion.div>
            ) : (
                // Medical/Casual/Emergency: Date Range Picker
                <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                                Start Date <span className="text-[#F14D24]">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="date"
                                    value={data.startDate}
                                    onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                                    className={cn(
                                        "w-full pl-12 pr-4 py-4 bg-white/80 border-2 rounded-xl",
                                        "focus:ring-0 focus:border-[#31267D] outline-none",
                                        "text-sm font-semibold text-slate-900",
                                        "transition-all duration-200",
                                        "placeholder:text-slate-400"
                                    )}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                                End Date <span className="text-[#F14D24]">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="date"
                                    value={data.endDate}
                                    onChange={(e) => onChange({ ...data, endDate: e.target.value })}
                                    min={data.startDate}
                                    className={cn(
                                        "w-full pl-12 pr-4 py-4 bg-white/80 border-2 rounded-xl",
                                        "focus:ring-0 focus:border-[#31267D] outline-none",
                                        "text-sm font-semibold text-slate-900",
                                        "transition-all duration-200",
                                        "placeholder:text-slate-400"
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Quick duration tags */}
                    {data.startDate && (
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { label: "1 Day", days: 0 },
                                { label: "3 Days", days: 2 },
                                { label: "1 Week", days: 6 },
                            ].map((option) => {
                                const end = new Date(data.startDate);
                                end.setDate(end.getDate() + option.days);
                                const endStr = end.toISOString().split("T")[0];
                                const isSelected = data.endDate === endStr;
                                
                                return (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => onChange({ ...data, endDate: endStr })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                            isSelected
                                                ? "bg-[#31267D] text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* CEO Note / Reason Field */}
            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    CEO Note / Reason <span className="text-[#F14D24]">*</span>
                </label>
                <textarea
                    value={data.reason}
                    onChange={(e) => onChange({ ...data, reason: e.target.value })}
                    placeholder={
                        data.type === "medical"
                            ? "Briefly describe your medical condition or appointment..."
                            : data.type === "casual"
                            ? "What will you be doing during your time off?"
                            : data.type === "early"
                            ? "Why do you need to leave early today?"
                            : "Please describe the emergency situation..."
                    }
                    rows={4}
                    className={cn(
                        "w-full px-4 py-4 bg-white/80 border-2 rounded-xl",
                        "focus:ring-0 focus:border-[#31267D] outline-none",
                        "text-sm font-semibold text-slate-900",
                        "resize-none",
                        "placeholder:text-slate-400",
                        "transition-all duration-200"
                    )}
                />
                <p className="text-xs text-slate-500 ml-1">
                    This will be visible to your administrator and CEO
                </p>
            </motion.div>

            {/* Summary preview */}
            {validateForm(data) && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-[#31267D]/5 rounded-xl p-4 border border-[#31267D]/10"
                >
                    <p className="text-xs font-bold text-[#31267D] uppercase tracking-wider mb-2">
                        Request Summary
                    </p>
                    <div className="space-y-1 text-sm">
                        <p className="text-slate-700">
                            <span className="font-semibold">Type:</span> {selectedType?.label}
                        </p>
                        {data.type === "early" ? (
                            <p className="text-slate-700">
                                <span className="font-semibold">Departure:</span> {data.departureTime}
                            </p>
                        ) : (
                            <p className="text-slate-700">
                                <span className="font-semibold">Duration:</span>{" "}
                                {data.startDate && format(new Date(data.startDate), "MMM d")}
                                {data.endDate && data.endDate !== data.startDate && (
                                    <> - {format(new Date(data.endDate), "MMM d, yyyy")}</>
                                )}
                                {data.startDate && data.endDate && (
                                    <span className="text-slate-500 text-xs ml-1">
                                        ({Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

// =====================================================
// SUCCESS STEP
// =====================================================
const SuccessStep: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center py-8"
    >
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200"
        >
            <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-slate-900 mb-2"
        >
            Request Submitted!
        </motion.h3>
        
        <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-slate-500 mb-8 max-w-xs mx-auto"
        >
            Your leave request has been sent to the CEO for approval. You&apos;ll be notified once it&apos;s reviewed.
        </motion.p>
        
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onClose}
            style={{ backgroundColor: BRAND.orange }}
            className="px-10 py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-200 hover:shadow-xl transition-all active:scale-95"
        >
            Got it
        </motion.button>
    </motion.div>
);

// =====================================================
// MAIN LEAVE REQUEST MODAL COMPONENT
// =====================================================
interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
    setInteracting?: (interacting: boolean) => void;
}

type Step = "type" | "form" | "success";

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess,
    setInteracting,
}) => {
    const { profile } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>("type");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<LeaveFormData>({
        type: "casual",
        startDate: "",
        endDate: "",
        departureTime: "",
        reason: "",
    });

    const handleTypeSelect = (type: LeaveType) => {
        setFormData((prev) => ({ ...prev, type }));
        setCurrentStep("form");
    };

    const handleBack = () => {
        if (currentStep === "form") {
            setCurrentStep("type");
        }
    };

    const handleSubmit = async () => {
        if (!profile) {
            toast.error("Please login to submit requests");
            return;
        }

        if (!validateForm(formData)) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        if (setInteracting) setInteracting(true);

        try {
            const selectedType = LEAVE_TYPES.find((t) => t.id === formData.type);
            
            let requestPayload: any = {
                type: "leave",
                submitted_by: profile.id,
                status: "pending",
                created_at: new Date().toISOString(),
            };

            // Build title and description based on leave type
            if (formData.type === "early") {
                requestPayload.title = `Early Leave: ${formData.departureTime}`;
                requestPayload.description = `[${selectedType?.label.toUpperCase()}] Departure Time: ${formData.departureTime} | Reason: ${formData.reason}`;
                requestPayload.time_range = formData.departureTime;
            } else {
                const startFormatted = format(new Date(formData.startDate), "MMM d");
                const endFormatted = format(new Date(formData.endDate), "MMM d, yyyy");
                const days = Math.ceil(
                    (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 
                    (1000 * 60 * 60 * 24)
                ) + 1;
                
                requestPayload.title = `${selectedType?.label}: ${startFormatted}${formData.startDate !== formData.endDate ? ` - ${endFormatted}` : ""}`;
                requestPayload.description = `[${selectedType?.label.toUpperCase()}] ${days} day${days > 1 ? "s" : ""}: ${formData.reason}`;
                requestPayload.dates = `${formData.startDate} - ${formData.endDate}`;
                requestPayload.total_days = days;
            }

            requestPayload.priority = formData.type === "emergency" ? "urgent" : "normal";

            const { error } = await supabase.from("requests").insert(requestPayload);

            if (error) {
                console.error("Submit error:", error);
                toast.error("Failed to submit request: " + error.message);
            } else {
                toast.success("Leave request submitted successfully!");
                setCurrentStep("success");
                if (onSubmitSuccess) onSubmitSuccess();
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit request");
        } finally {
            setIsSubmitting(false);
            if (setInteracting) setInteracting(false);
        }
    };

    const handleClose = () => {
        // Reset state
        setCurrentStep("type");
        setFormData({
            type: "casual",
            startDate: "",
            endDate: "",
            departureTime: "",
            reason: "",
        });
        onClose();
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case "type":
                return <TypeSelectionStep selectedType={formData.type} onSelect={handleTypeSelect} />;
            case "form":
                return <FormStep data={formData} onChange={setFormData} />;
            case "success":
                return <SuccessStep onClose={handleClose} />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl"
            >
                {/* Glass Background */}
                <div
                    className="absolute inset-0 backdrop-blur-xl"
                    style={{ backgroundColor: BRAND.glassBg }}
                />
                <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ border: `1.5px solid ${BRAND.glassBorder}` }}
                />

                {/* Content */}
                <div className="relative flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#31267D]/10">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: BRAND.indigo }}
                            >
                                {currentStep === "success" ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : (
                                    <Calendar className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {currentStep === "success" ? "Success" : "Request Time Off"}
                                </h3>
                                {currentStep !== "success" && (
                                    <p className="text-xs text-slate-500">
                                        Step {currentStep === "type" ? 1 : 2} of 2
                                    </p>
                                )}
                            </div>
                        </div>
                        {currentStep !== "success" && (
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Navigation */}
                    {currentStep !== "type" && currentStep !== "success" && (
                        <div className="px-6 py-5 border-t border-[#31267D]/10 bg-white/40">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBack}
                                    disabled={isSubmitting}
                                    className={cn(
                                        "flex-1 py-3.5 px-4 rounded-xl border-2 border-slate-200",
                                        "text-slate-600 font-bold text-xs uppercase tracking-wider",
                                        "hover:bg-slate-50 hover:border-slate-300",
                                        "transition-all duration-200",
                                        "flex items-center justify-center gap-2",
                                        isSubmitting && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !validateForm(formData)}
                                    className={cn(
                                        "flex-[2] py-3.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider",
                                        "shadow-lg hover:shadow-xl",
                                        "transition-all duration-200",
                                        "flex items-center justify-center gap-2",
                                        (isSubmitting || !validateForm(formData)) && "opacity-70 cursor-not-allowed"
                                    )}
                                    style={{ backgroundColor: BRAND.orange }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default LeaveRequestModal;
