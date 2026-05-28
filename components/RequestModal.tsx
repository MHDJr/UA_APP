"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ChevronRight,
    ChevronLeft,
    Send,
    Wallet,
    Shield,
    UserCog,
    Key,
    CheckCircle2,
    AlertCircle,
    DollarSign,
    Building2,
    Code2,
    Briefcase,
    Calendar,
    FileText,
    ArrowRight,
    Sparkles,
    Loader2,
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
    glassBg: "rgba(255, 255, 255, 0.85)",
    glassBorder: "rgba(49, 38, 125, 0.12)",
};

// =====================================================
// TYPES
// =====================================================
type RequestType = "budget" | "access_elevation" | "role_change" | "permission";

type RequestTypeConfig = {
    id: RequestType;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
};

interface BudgetFormData {
    amount: string;
    category: "marketing" | "development" | "office" | "other" | "";
    otherCategory?: string;
    reason: string;
}

interface AccessElevationFormData {
    system: "finance" | "student_db" | "admin_panel" | "other" | "";
    otherSystem?: string;
    duration: "permanent" | "temporary" | "";
    justification: string;
}

interface RoleChangeFormData {
    newDesignation: string;
    effectiveDate: string;
    reason: string;
}

interface PermissionFormData {
    specificAction: string;
    otherSpecificAction?: string;
    managerialJustification: string;
    urgency: "low" | "medium" | "high" | "urgent";
}

type FormData =
    | { type: "budget"; data: BudgetFormData }
    | { type: "access_elevation"; data: AccessElevationFormData }
    | { type: "role_change"; data: RoleChangeFormData }
    | { type: "permission"; data: PermissionFormData };

// =====================================================
// REQUEST TYPE CONFIGURATION
// =====================================================
const REQUEST_TYPES: RequestTypeConfig[] = [
    {
        id: "budget",
        label: "Budget Request",
        description: "Request funds for marketing, development, or office expenses",
        icon: Wallet,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
    },
    {
        id: "access_elevation",
        label: "Access Elevation",
        description: "Request elevated system access for specific modules",
        icon: Shield,
        color: "text-[#31267D]",
        bgColor: "bg-[#31267D]/10",
    },
    {
        id: "role_change",
        label: "Role Change",
        description: "Request a change in designation or responsibilities",
        icon: UserCog,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    {
        id: "permission",
        label: "Permission Request",
        description: "Request special permissions for specific actions",
        icon: Key,
        color: "text-rose-600",
        bgColor: "bg-rose-50",
    },
];

// =====================================================
// ANIMATION VARIANTS
// =====================================================
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const validateForm = (formData: FormData): boolean => {
    switch (formData.type) {
        case "budget":
            return (
                formData.data.amount.trim() !== "" &&
                formData.data.category !== "" &&
                (formData.data.category !== "other" || (formData.data.otherCategory || "").trim() !== "") &&
                formData.data.reason.trim() !== ""
            );
        case "access_elevation":
            return (
                formData.data.system !== "" &&
                (formData.data.system !== "other" || (formData.data.otherSystem || "").trim() !== "") &&
                formData.data.duration !== "" &&
                formData.data.justification.trim() !== ""
            );
        case "role_change":
            return (
                formData.data.newDesignation.trim() !== "" &&
                formData.data.effectiveDate !== "" &&
                formData.data.reason.trim() !== ""
            );
        case "permission":
            return (
                formData.data.specificAction !== "" &&
                (formData.data.specificAction !== "custom" || (formData.data.otherSpecificAction || "").trim() !== "") &&
                formData.data.managerialJustification.trim() !== ""
            );
        default:
            return false;
    }
};

// =====================================================
// REQUEST TYPE SELECTION STEP
// =====================================================
const TypeSelectionStep: React.FC<{
    selectedType: RequestType | null;
    onSelect: (type: RequestType) => void;
}> = ({ selectedType, onSelect }) => {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
        >
            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#31267D]/10 mb-4"
                >
                    <Sparkles className="w-4 h-4 text-[#31267D]" />
                    <span className="text-xs font-bold text-[#31267D] uppercase tracking-wider">
                        Select Request Type
                    </span>
                </motion.div>
                <p className="text-sm text-slate-500">
                    Choose the type of request you need to submit
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REQUEST_TYPES.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;

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
                                    ? "border-[#31267D] bg-[#31267D]/5 shadow-lg shadow-[#31267D]/10"
                                    : "border-slate-200 bg-white/80 hover:border-[#31267D]/30"
                            )}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="selectedIndicator"
                                    className="absolute top-3 right-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#31267D] flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                </motion.div>
                            )}

                            <div
                                className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
                                    type.bgColor
                                )}
                            >
                                <Icon className={cn("w-6 h-6", type.color)} />
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
// FORM STEPS COMPONENTS
// =====================================================
const BudgetFormStep: React.FC<{
    data: BudgetFormData;
    onChange: (data: BudgetFormData) => void;
}> = ({ data, onChange }) => {
    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 mb-4">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Budget Request
                    </span>
                </div>
                <p className="text-sm text-slate-500">Enter the budget details</p>
            </div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Amount <span className="text-[#F14D24]">*</span>
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="number"
                        value={data.amount}
                        onChange={(e) => onChange({ ...data, amount: e.target.value })}
                        placeholder="Enter amount..."
                        className={cn(
                            "w-full pl-12 pr-4 py-4 bg-white/80 border-2 rounded-xl",
                            "focus:ring-0 focus:border-[#31267D] outline-none",
                            "text-sm font-semibold text-slate-900",
                            "transition-all duration-200",
                            "placeholder:text-slate-400"
                        )}
                    />
                </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Category <span className="text-[#F14D24]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { id: "marketing", label: "Marketing", icon: Building2 },
                        { id: "development", label: "Dev", icon: Code2 },
                        { id: "office", label: "Office", icon: Briefcase },
                        { id: "other", label: "Other", icon: Sparkles },
                    ].map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = data.category === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onChange({ ...data, category: cat.id as any })}
                                className={cn(
                                    "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                    isSelected
                                        ? "border-[#31267D] bg-[#31267D]/5"
                                        : "border-slate-200 bg-white/60 hover:border-[#31267D]/30"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isSelected ? "text-[#31267D]" : "text-slate-400")} />
                                <span className={cn("text-xs font-semibold", isSelected ? "text-[#31267D]" : "text-slate-600")}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <AnimatePresence>
                    {data.category === "other" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                        >
                            <input
                                type="text"
                                value={data.otherCategory || ""}
                                onChange={(e) => onChange({ ...data, otherCategory: e.target.value })}
                                placeholder="Type the category..."
                                className={cn(
                                    "w-full px-4 py-3 bg-white/80 border-2 rounded-xl",
                                    "focus:ring-0 focus:border-[#31267D] outline-none",
                                    "text-sm font-semibold text-slate-900",
                                    "placeholder:text-slate-400"
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Reason <span className="text-[#F14D24]">*</span>
                </label>
                <textarea
                    value={data.reason}
                    onChange={(e) => onChange({ ...data, reason: e.target.value })}
                    placeholder="Explain why this budget is needed..."
                    rows={4}
                    className={cn(
                        "w-full px-4 py-4 bg-white/80 border-2 rounded-xl",
                        "focus:ring-0 focus:border-[#31267D] outline-none",
                        "text-sm font-semibold text-slate-900",
                        "resize-none",
                        "placeholder:text-slate-400"
                    )}
                />
            </motion.div>
        </motion.div>
    );
};

const AccessElevationFormStep: React.FC<{
    data: AccessElevationFormData;
    onChange: (data: AccessElevationFormData) => void;
}> = ({ data, onChange }) => {
    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#31267D]/10 mb-4">
                    <Shield className="w-4 h-4 text-[#31267D]" />
                    <span className="text-xs font-bold text-[#31267D] uppercase tracking-wider">
                        Access Elevation
                    </span>
                </div>
                <p className="text-sm text-slate-500">Specify system access requirements</p>
            </div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    System/Module <span className="text-[#F14D24]">*</span>
                </label>
                <div className="space-y-2">
                    {[
                        { id: "finance", label: "Finance System", desc: "Access to financial records and reports" },
                        { id: "student_db", label: "Student Database", desc: "Full access to student records" },
                        { id: "admin_panel", label: "Admin Panel", desc: "System administration privileges" },
                        { id: "other", label: "Other System", desc: "Request access to other systems" },
                    ].map((sys) => {
                        const isSelected = data.system === sys.id;
                        return (
                            <button
                                key={sys.id}
                                onClick={() => onChange({ ...data, system: sys.id as any })}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                                    isSelected
                                        ? "border-[#31267D] bg-[#31267D]/5"
                                        : "border-slate-200 bg-white/60 hover:border-[#31267D]/30"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn("font-semibold text-sm", isSelected ? "text-[#31267D]" : "text-slate-700")}>
                                        {sys.label}
                                    </span>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#31267D]" />}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{sys.desc}</p>
                            </button>
                        );
                    })}
                </div>
                <AnimatePresence>
                    {data.system === "other" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                        >
                            <input
                                type="text"
                                value={data.otherSystem || ""}
                                onChange={(e) => onChange({ ...data, otherSystem: e.target.value })}
                                placeholder="Type the system name..."
                                className={cn(
                                    "w-full px-4 py-3 bg-white/80 border-2 rounded-xl",
                                    "focus:ring-0 focus:border-[#31267D] outline-none",
                                    "text-sm font-semibold text-slate-900",
                                    "placeholder:text-slate-400"
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Duration <span className="text-[#F14D24]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: "permanent", label: "Permanent", desc: "Ongoing access" },
                        { id: "temporary", label: "Temporary", desc: "Time-limited access" },
                    ].map((dur) => {
                        const isSelected = data.duration === dur.id;
                        return (
                            <button
                                key={dur.id}
                                onClick={() => onChange({ ...data, duration: dur.id as any })}
                                className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all",
                                    isSelected
                                        ? "border-[#31267D] bg-[#31267D]/5"
                                        : "border-slate-200 bg-white/60 hover:border-[#31267D]/30"
                                )}
                            >
                                <span className={cn("font-semibold text-sm block", isSelected ? "text-[#31267D]" : "text-slate-700")}>
                                    {dur.label}
                                </span>
                                <span className="text-xs text-slate-500">{dur.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Justification <span className="text-[#F14D24]">*</span>
                </label>
                <textarea
                    value={data.justification}
                    onChange={(e) => onChange({ ...data, justification: e.target.value })}
                    placeholder="Explain why elevated access is required..."
                    rows={3}
                    className={cn(
                        "w-full px-4 py-4 bg-white/80 border-2 rounded-xl",
                        "focus:ring-0 focus:border-[#31267D] outline-none",
                        "text-sm font-semibold text-slate-900",
                        "resize-none",
                        "placeholder:text-slate-400"
                    )}
                />
            </motion.div>
        </motion.div>
    );
};

const RoleChangeFormStep: React.FC<{
    data: RoleChangeFormData;
    onChange: (data: RoleChangeFormData) => void;
}> = ({ data, onChange }) => {
    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 mb-4">
                    <UserCog className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                        Role Change
                    </span>
                </div>
                <p className="text-sm text-slate-500">Request a designation change</p>
            </div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    New Designation <span className="text-[#F14D24]">*</span>
                </label>
                <input
                    type="text"
                    value={data.newDesignation}
                    onChange={(e) => onChange({ ...data, newDesignation: e.target.value })}
                    placeholder="e.g., Senior Developer, Team Lead..."
                    className={cn(
                        "w-full px-4 py-4 bg-white/80 border-2 rounded-xl",
                        "focus:ring-0 focus:border-[#31267D] outline-none",
                        "text-sm font-semibold text-slate-900",
                        "placeholder:text-slate-400"
                    )}
                />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Effective Date <span className="text-[#F14D24]">*</span>
                </label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="date"
                        value={data.effectiveDate}
                        onChange={(e) => onChange({ ...data, effectiveDate: e.target.value })}
                        className={cn(
                            "w-full pl-12 pr-4 py-4 bg-white/80 border-2 rounded-xl",
                            "focus:ring-0 focus:border-[#31267D] outline-none",
                            "text-sm font-semibold text-slate-900",
                            "placeholder:text-slate-400"
                        )}
                    />
                </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Reason for Change <span className="text-[#F14D24]">*</span>
                </label>
                <textarea
                    value={data.reason}
                    onChange={(e) => onChange({ ...data, reason: e.target.value })}
                    placeholder="Explain the rationale for this role change..."
                    rows={4}
                    className={cn(
                        "w-full px-4 py-4 bg-white/80 border-2 rounded-xl",
                        "focus:ring-0 focus:border-[#31267D] outline-none",
                        "text-sm font-semibold text-slate-900",
                        "resize-none",
                        "placeholder:text-slate-400"
                    )}
                />
            </motion.div>
        </motion.div>
    );
};

const PermissionFormStep: React.FC<{
    data: PermissionFormData;
    onChange: (data: PermissionFormData) => void;
}> = ({ data, onChange }) => {
    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 mb-4">
                    <Key className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                        Permission Request
                    </span>
                </div>
                <p className="text-sm text-slate-500">Request special action permissions</p>
            </div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Specific Action <span className="text-[#F14D24]">*</span>
                </label>
                <div className="space-y-2">
                    {[
                        { id: "delete_records", label: "Delete Records", desc: "Permission to permanently delete data" },
                        { id: "export_data", label: "Export Data", desc: "Bulk data export privileges" },
                        { id: "modify_financial", label: "Modify Financial", desc: "Edit financial transactions" },
                        { id: "approve_expenses", label: "Approve Expenses", desc: "Authorize expenditure requests" },
                        { id: "custom", label: "Custom Action", desc: "Other specific permission" },
                    ].map((action) => {
                        const isSelected = data.specificAction === action.id;
                        return (
                            <button
                                key={action.id}
                                onClick={() => onChange({ ...data, specificAction: action.id })}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                                    isSelected
                                        ? "border-[#31267D] bg-[#31267D]/5"
                                        : "border-slate-200 bg-white/60 hover:border-[#31267D]/30"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn("font-semibold text-sm", isSelected ? "text-[#31267D]" : "text-slate-700")}>
                                        {action.label}
                                    </span>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#31267D]" />}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                            </button>
                        );
                    })}
                </div>
                <AnimatePresence>
                    {data.specificAction === "custom" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                        >
                            <input
                                type="text"
                                value={data.otherSpecificAction || ""}
                                onChange={(e) => onChange({ ...data, otherSpecificAction: e.target.value })}
                                placeholder="Describe the custom action..."
                                className={cn(
                                    "w-full px-4 py-3 bg-white/80 border-2 rounded-xl",
                                    "focus:ring-0 focus:border-[#31267D] outline-none",
                                    "text-sm font-semibold text-slate-900",
                                    "placeholder:text-slate-400"
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Urgency Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { id: "low", label: "Low", color: "bg-slate-100 text-slate-600" },
                        { id: "medium", label: "Medium", color: "bg-blue-50 text-blue-600" },
                        { id: "high", label: "High", color: "bg-amber-50 text-amber-600" },
                        { id: "urgent", label: "Urgent", color: "bg-rose-50 text-rose-600" },
                    ].map((urg) => {
                        const isSelected = data.urgency === urg.id;
                        return (
                            <button
                                key={urg.id}
                                onClick={() => onChange({ ...data, urgency: urg.id as any })}
                                className={cn(
                                    "py-2 px-2 rounded-lg text-xs font-bold uppercase transition-all",
                                    isSelected ? cn(urg.color, "ring-2 ring-offset-1 ring-[#31267D]") : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                            >
                                {urg.label}
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Administrative Justification <span className="text-[#F14D24]">*</span>
                </label>
                <textarea
                    value={data.managerialJustification}
                    onChange={(e) => onChange({ ...data, managerialJustification: e.target.value })}
                    placeholder="Provide detailed justification for this permission request..."
                    rows={4}
                    className={cn(
                        "w-full px-4 py-4 bg-white/80 border-2 rounded-xl",
                        "focus:ring-0 focus:border-[#31267D] outline-none",
                        "text-sm font-semibold text-slate-900",
                        "resize-none",
                        "placeholder:text-slate-400"
                    )}
                />
            </motion.div>
        </motion.div>
    );
};

// =====================================================
// REVIEW STEP
// =====================================================
const ReviewStep: React.FC<{
    formData: FormData;
    onEdit: () => void;
}> = ({ formData, onEdit }) => {
    const typeConfig = REQUEST_TYPES.find((t) => t.id === formData.type);
    const Icon = typeConfig?.icon || FileText;

    const renderReviewContent = () => {
        switch (formData.type) {
            case "budget":
                const budgetData = formData.data as BudgetFormData;
                const budgetCategory = budgetData.category === "other" ? (budgetData.otherCategory || "Other") : (budgetData.category.charAt(0).toUpperCase() + budgetData.category.slice(1));
                return (
                    <div className="space-y-4">
                        <ReviewItem label="Amount" value={`$${budgetData.amount}`} icon={DollarSign} />
                        <ReviewItem label="Category" value={budgetCategory} icon={Briefcase} />
                        <ReviewItem label="Reason" value={budgetData.reason} icon={FileText} isMultiline />
                    </div>
                );
            case "access_elevation":
                const accessData = formData.data as AccessElevationFormData;
                const accessSystem = accessData.system === "other" ? (accessData.otherSystem || "Other") : (accessData.system.replace("_", " ").toUpperCase());
                return (
                    <div className="space-y-4">
                        <ReviewItem label="System" value={accessSystem} icon={Shield} />
                        <ReviewItem label="Duration" value={accessData.duration.charAt(0).toUpperCase() + accessData.duration.slice(1)} icon={Calendar} />
                        <ReviewItem label="Justification" value={accessData.justification} icon={FileText} isMultiline />
                    </div>
                );
            case "role_change":
                const roleData = formData.data as RoleChangeFormData;
                return (
                    <div className="space-y-4">
                        <ReviewItem label="New Designation" value={roleData.newDesignation} icon={UserCog} />
                        <ReviewItem label="Effective Date" value={format(new Date(roleData.effectiveDate), "MMMM d, yyyy")} icon={Calendar} />
                        <ReviewItem label="Reason" value={roleData.reason} icon={FileText} isMultiline />
                    </div>
                );
            case "permission":
                const permData = formData.data as PermissionFormData;
                const permAction = permData.specificAction === "custom" ? (permData.otherSpecificAction || "Custom Action") : (permData.specificAction.replace("_", " ").toUpperCase());
                return (
                    <div className="space-y-4">
                        <ReviewItem label="Specific Action" value={permAction} icon={Key} />
                        <ReviewItem label="Urgency" value={permData.urgency.toUpperCase()} icon={AlertCircle} />
                        <ReviewItem label="Justification" value={permData.managerialJustification} icon={FileText} isMultiline />
                    </div>
                );
        }
    };

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#31267D]/10 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-[#31267D]" />
                    <span className="text-xs font-bold text-[#31267D] uppercase tracking-wider">
                        Review Request
                    </span>
                </div>
                <p className="text-sm text-slate-500">Verify all details before submission</p>
            </div>

            <motion.div variants={fadeInUp} className="bg-white/60 rounded-2xl p-6 border border-[#31267D]/10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeConfig?.bgColor)}>
                        <Icon className={cn("w-6 h-6", typeConfig?.color)} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{typeConfig?.label}</h3>
                        <p className="text-xs text-slate-500">Request Type</p>
                    </div>
                </div>

                {renderReviewContent()}
            </motion.div>

            <motion.button
                variants={fadeInUp}
                onClick={onEdit}
                className="w-full py-3 text-sm font-semibold text-[#31267D] hover:bg-[#31267D]/5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <ChevronLeft className="w-4 h-4" />
                Edit Details
            </motion.button>
        </motion.div>
    );
};

const ReviewItem: React.FC<{
    label: string;
    value: string;
    icon: React.ElementType;
    isMultiline?: boolean;
}> = ({ label, value, icon: Icon, isMultiline }) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={cn("text-sm font-semibold text-slate-900", isMultiline && "whitespace-pre-wrap mt-1")}>
                {value}
            </p>
        </div>
    </div>
);

// =====================================================
// SUCCESS STEP
// =====================================================
const SuccessStep: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
    >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
        >
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
            Your request has been submitted successfully and is now pending review.
        </p>
        <button
            onClick={onClose}
            style={{ backgroundColor: BRAND.orange }}
            className="px-8 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-shadow"
        >
            Close
        </button>
    </motion.div>
);

// =====================================================
// MAIN REQUEST MODAL COMPONENT
// =====================================================
interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
    setInteracting?: (interacting: boolean) => void;
}

type Step = "type" | "form" | "review" | "success";

export const RequestModal: React.FC<RequestModalProps> = ({
    isOpen,
    onClose,
    onSubmitSuccess,
    setInteracting,
}) => {
    const { profile } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>("type");
    const [selectedType, setSelectedType] = useState<RequestType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data states
    const [budgetForm, setBudgetForm] = useState<BudgetFormData>({
        amount: "",
        category: "",
        otherCategory: "",
        reason: "",
    });
    const [accessForm, setAccessForm] = useState<AccessElevationFormData>({
        system: "",
        otherSystem: "",
        duration: "",
        justification: "",
    });
    const [roleForm, setRoleForm] = useState<RoleChangeFormData>({
        newDesignation: "",
        effectiveDate: "",
        reason: "",
    });
    const [permissionForm, setPermissionForm] = useState<PermissionFormData>({
        specificAction: "",
        otherSpecificAction: "",
        managerialJustification: "",
        urgency: "medium",
    });

    const getFormData = useCallback((): FormData | null => {
        if (!selectedType) return null;
        switch (selectedType) {
            case "budget":
                return { type: "budget", data: budgetForm };
            case "access_elevation":
                return { type: "access_elevation", data: accessForm };
            case "role_change":
                return { type: "role_change", data: roleForm };
            case "permission":
                return { type: "permission", data: permissionForm };
        }
    }, [selectedType, budgetForm, accessForm, roleForm, permissionForm]);

    const handleTypeSelect = (type: RequestType) => {
        setSelectedType(type);
        setCurrentStep("form");
    };

    const handleNext = () => {
        if (currentStep === "form") {
            const formData = getFormData();
            if (formData && validateForm(formData)) {
                setCurrentStep("review");
            } else {
                toast.error("Please fill in all required fields");
            }
        }
    };

    const handleBack = () => {
        if (currentStep === "form") {
            setCurrentStep("type");
            setSelectedType(null);
        } else if (currentStep === "review") {
            setCurrentStep("form");
        }
    };

    const handleSubmit = async () => {
        if (!profile) {
            toast.error("Please login to submit requests");
            return;
        }

        const formData = getFormData();
        if (!formData) return;

        setIsSubmitting(true);
        if (setInteracting) setInteracting(true);

        try {
            let requestPayload: any = {
                type: formData.type,
                submitted_by: profile.id,
                status: "pending",
                created_at: new Date().toISOString(),
            };

            // Build title and description based on type
            switch (formData.type) {
                case "budget":
                    const category = formData.data.category === "other" ? formData.data.otherCategory : formData.data.category;
                    requestPayload.title = `Budget Request: ${(category || "").toUpperCase()}`;
                    requestPayload.description = `Amount: $${formData.data.amount} | Category: ${category} | Reason: ${formData.data.reason}`;
                    requestPayload.amount = parseFloat(formData.data.amount);
                    break;
                case "access_elevation":
                    const system = formData.data.system === "other" ? formData.data.otherSystem : formData.data.system;
                    requestPayload.title = `Access Request: ${(system || "").replace("_", " ").toUpperCase()}`;
                    requestPayload.description = `System: ${system} | Duration: ${formData.data.duration} | Justification: ${formData.data.justification}`;
                    break;
                case "role_change":
                    requestPayload.title = `Role Change: ${formData.data.newDesignation}`;
                    requestPayload.description = `New Designation: ${formData.data.newDesignation} | Effective: ${formData.data.effectiveDate} | Reason: ${formData.data.reason}`;
                    break;
                case "permission":
                    const action = formData.data.specificAction === "custom" ? formData.data.otherSpecificAction : formData.data.specificAction;
                    requestPayload.title = `Permission: ${(action || "").replace("_", " ").toUpperCase()}`;
                    requestPayload.description = `Action: ${action} | Urgency: ${formData.data.urgency} | Justification: ${formData.data.managerialJustification}`;
                    requestPayload.priority = formData.data.urgency;
                    break;
            }

            const { error } = await supabase.from("requests").insert(requestPayload);

            if (error) {
                console.error("Submit error:", error);
                toast.error("Failed to submit request: " + error.message);
            } else {
                toast.success("Request submitted successfully!");
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
        setSelectedType(null);
        setBudgetForm({ amount: "", category: "", otherCategory: "", reason: "" });
        setAccessForm({ system: "", otherSystem: "", duration: "", justification: "" });
        setRoleForm({ newDesignation: "", effectiveDate: "", reason: "" });
        setPermissionForm({ specificAction: "", otherSpecificAction: "", managerialJustification: "", urgency: "medium" });
        onClose();
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case "type":
                return <TypeSelectionStep selectedType={selectedType} onSelect={handleTypeSelect} />;
            case "form":
                if (!selectedType) return null;
                switch (selectedType) {
                    case "budget":
                        return <BudgetFormStep data={budgetForm} onChange={setBudgetForm} />;
                    case "access_elevation":
                        return <AccessElevationFormStep data={accessForm} onChange={setAccessForm} />;
                    case "role_change":
                        return <RoleChangeFormStep data={roleForm} onChange={setRoleForm} />;
                    case "permission":
                        return <PermissionFormStep data={permissionForm} onChange={setPermissionForm} />;
                }
                break;
            case "review":
                const formData = getFormData();
                return formData ? <ReviewStep formData={formData} onEdit={() => setCurrentStep("form")} /> : null;
            case "success":
                return <SuccessStep onClose={handleClose} />;
        }
    };

    if (!isOpen) return null;

    const getStepNumber = () => {
        switch (currentStep) {
            case "type":
                return 1;
            case "form":
                return 2;
            case "review":
                return 3;
            case "success":
                return 4;
        }
    };

    const totalSteps = 3;
    const currentStepNum = getStepNumber();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl"
            >
                {/* Glass Background */}
                <div
                    className="absolute inset-0 backdrop-blur-xl"
                    style={{ backgroundColor: BRAND.glassBg }}
                />
                <div
                    className="absolute inset-0 rounded-3xl"
                    style={{ border: `1px solid ${BRAND.glassBorder}` }}
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
                                    <FileText className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {currentStep === "success" ? "Success" : "New Request"}
                                </h3>
                                {currentStep !== "success" && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map((step) => (
                                                <div
                                                    key={step}
                                                    className={cn(
                                                        "w-6 h-1.5 rounded-full transition-colors",
                                                        step <= currentStepNum ? "bg-[#31267D]" : "bg-slate-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            Step {currentStepNum} of {totalSteps}
                                        </span>
                                    </div>
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
                                variants={fadeIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
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
                                {currentStep === "review" ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={cn(
                                            "flex-[2] py-3.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider",
                                            "shadow-lg hover:shadow-xl",
                                            "transition-all duration-200",
                                            "flex items-center justify-center gap-2",
                                            isSubmitting && "opacity-70 cursor-not-allowed"
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
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className={cn(
                                            "flex-[2] py-3.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider",
                                            "shadow-lg hover:shadow-xl",
                                            "transition-all duration-200",
                                            "flex items-center justify-center gap-2"
                                        )}
                                        style={{ backgroundColor: BRAND.indigo }}
                                    >
                                        Continue
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default RequestModal;
