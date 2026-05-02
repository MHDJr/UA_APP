"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    UserPlus,
    Loader2,
    Mail,
    User,
    Briefcase,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Wallet,
    TrendingUp,
    AtSign,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AddStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ROLES = [
    {
        value: "staff",
        label: "Staff",
        desc: "Standard Access",
        Icon: ShieldCheck,
    },
    {
        value: "accounts",
        label: "Accounts",
        desc: "Financial Access",
        Icon: Wallet,
    },
    {
        value: "sales",
        label: "Sales",
        desc: "Revenue Access",
        Icon: TrendingUp,
    },
];

// ─── Brand tokens ───────────────────────────────────────────────────────────
const VIOLET = "#2D2A77";
const ORANGE = "#F15A24";

export default function AddStaffDialog({
    open,
    onOpenChange,
}: AddStaffDialogProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        designation: "",
        password: "",
        role: "staff",
        requireReset: true,
        hasManagerAccess: false,
    });

    const patch = (key: string, value: string | boolean) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const { fullName, email, username, designation, password } = formData;
        if (!fullName || !email || !username || !designation || !password) {
            toast.error("All mission-critical fields required");
            return;
        }

        setLoading(true);
        try {
            // Check if profile already exists in profiles table
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from("profiles")
                .select("email, username")
                .or(`email.eq.${email},username.eq.${username}`)
                .maybeSingle();
                
            if (existingProfile && !profileCheckError) {
                if (existingProfile.email === email) {
                    throw new Error(`User with email ${email} already exists. Please use a different email.`);
                }
                if (existingProfile.username === username) {
                    throw new Error(`Username ${username} is already taken. Please choose a different username.`);
                }
            }

            console.log("Creating new user:", { email, username, fullName });
            
            // Create the user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username,
                    },
                },
            });

            if (authError) {
                if (authError.message.includes("already registered")) {
                    throw new Error(`User with email ${email} is already registered. Please use a different email or contact admin to reset the existing account.`);
                }
                throw new Error(authError.message);
            }

            if (!authData.user) {
                throw new Error("Failed to create user account");
            }

            // Create the user's profile in the profiles table
            console.log("Creating profile for user:", authData.user.id, formData);
            const { data: profileData, error: profileError } = await supabase.from("profiles").insert({
                id: authData.user.id,
                email: email,
                full_name: fullName,
                username: username,
                designation: designation,
                role: formData.role,
                department: formData.role === "sales" ? "Sales" : formData.role === "accounts" ? "Finance" : "Staff",
                status: "offline",
            }).select();

            console.log("Profile creation result:", { profileData, profileError });

            if (profileError) {
                // If profile creation fails, we can't delete the auth user with anon client
                // Just log the error and let the admin handle cleanup if needed
                throw new Error(`Profile creation failed: ${profileError.message}`);
            }

            // Log the activity
            await supabase.from("activity_feed").insert({
                action_type: "staff_created",
                description: `New staff member ${fullName} (${username}) was added by admin`,
                user_id: authData.user.id,
            });

            toast.success(
                `Personnel @${username} successfully provisioned.`,
            );
            onOpenChange(false);
            setFormData({
                fullName: "",
                email: "",
                username: "",
                designation: "",
                password: "",
                role: "staff",
                requireReset: true,
                hasManagerAccess: false,
            });
            
            // Trigger a refresh of the staff list in the parent component
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('staff-created', { detail: { username, role: formData.role } }));
            }, 100);
        } catch (error: any) {
            console.error("Staff creation error:", error);
            toast.error(error.message || "Failed to create staff account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="p-0 overflow-hidden border-0 shadow-none bg-transparent"
                style={{ maxWidth: 620 }}
            >
                {/* ── Backdrop glow ── */}
                <div
                    className="absolute inset-0 -z-10 rounded-2xl opacity-30 blur-3xl pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at 30% 0%, ${ORANGE}55 0%, transparent 60%),
                                     radial-gradient(ellipse at 80% 100%, ${VIOLET}88 0%, transparent 60%)`,
                    }}
                />

                {/* ── Glass card ── */}
                <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.82)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        boxShadow: `0 20px 60px rgba(45,42,119,0.18),
                                    0 4px 20px rgba(241,90,36,0.10),
                                    0 1px 0px rgba(255,255,255,0.8) inset`,
                    }}
                >
                    {/* ── Top accent bar ── */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[3px]"
                        style={{
                            background: `linear-gradient(90deg, ${ORANGE}, ${VIOLET})`,
                        }}
                    />

                    {/* ─────────── HEADER ─────────── */}
                    <div className="px-8 pt-8 pb-6">
                        {/* Logo row */}
                        <div className="flex items-center gap-2.5 mb-5">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black tracking-widest shadow-md"
                                style={{
                                    background: `linear-gradient(135deg, ${VIOLET}, #4B47C0)`,
                                    boxShadow: `0 4px 14px ${VIOLET}55`,
                                }}
                            >
                                UA
                            </div>
                            <span
                                className="text-[11px] font-bold tracking-[0.18em] uppercase"
                                style={{ color: VIOLET }}
                            >
                                Usthad Academy
                            </span>
                        </div>

                        <DialogTitle
                            className="text-[18px] font-black uppercase tracking-[0.12em] leading-tight"
                            style={{ color: VIOLET }}
                        >
                            Provision New Personnel
                        </DialogTitle>
                        <p className="mt-1 text-[12px] text-gray-400 font-medium tracking-wide">
                            Securely deploying new credentials to the UA Digital
                            Nervous System
                        </p>
                    </div>

                    {/* ─────────── FORM ─────────── */}
                    <form onSubmit={handleSubmit} className="px-8 pb-8">
                        {/* 2-column identity grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
                            <FieldBox
                                id="fullName"
                                label="Full Name"
                                Icon={User}
                                placeholder="e.g. John Doe"
                                value={formData.fullName}
                                onChange={(v) => patch("fullName", v)}
                            />
                            <FieldBox
                                id="username"
                                label="Login ID"
                                Icon={AtSign}
                                placeholder="username"
                                value={formData.username}
                                onChange={(v) => patch("username", v)}
                            />
                            <FieldBox
                                id="designation"
                                label="Designation"
                                Icon={Briefcase}
                                placeholder="e.g. Operations"
                                value={formData.designation}
                                onChange={(v) => patch("designation", v)}
                            />
                            <FieldBox
                                id="email"
                                label="Email"
                                Icon={Mail}
                                type="email"
                                placeholder="email@ua.academy"
                                value={formData.email}
                                onChange={(v) => patch("email", v)}
                            />
                        </div>

                        {/* ── System Role ── */}
                        <div className="mb-6">
                            <FieldLabel text="System Role" />
                            <div className="grid grid-cols-3 gap-3 mt-2">
                                {ROLES.map(({ value, label, desc, Icon }) => {
                                    const active = formData.role === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                patch("role", value)
                                            }
                                            className="relative rounded-xl p-3.5 text-left transition-all duration-300 focus:outline-none"
                                            style={{
                                                border: active
                                                    ? `2px solid ${VIOLET}`
                                                    : "2px solid #E5E7EB",
                                                background: active
                                                    ? `linear-gradient(135deg, rgba(241,90,36,0.07), rgba(45,42,119,0.07))`
                                                    : "rgba(249,250,251,0.8)",
                                                boxShadow: active
                                                    ? `0 0 0 4px rgba(45,42,119,0.08), 0 4px 12px rgba(45,42,119,0.12)`
                                                    : "none",
                                                transform: active
                                                    ? "translateY(-1px)"
                                                    : "translateY(0)",
                                            }}
                                        >
                                            {/* Active dot */}
                                            {active && (
                                                <span
                                                    className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
                                                    style={{
                                                        background: VIOLET,
                                                        boxShadow: `0 0 6px ${VIOLET}`,
                                                    }}
                                                />
                                            )}
                                            <div
                                                className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                                                style={{
                                                    background: active
                                                        ? `linear-gradient(135deg, ${ORANGE}22, ${VIOLET}22)`
                                                        : "#F3F4F6",
                                                }}
                                            >
                                                <Icon
                                                    className="w-4 h-4"
                                                    style={{
                                                        color: active
                                                            ? VIOLET
                                                            : "#9CA3AF",
                                                    }}
                                                />
                                            </div>
                                            <p
                                                className="text-[12px] font-bold uppercase tracking-wider"
                                                style={{
                                                    color: active
                                                        ? VIOLET
                                                        : "#374151",
                                                }}
                                            >
                                                {label}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {desc}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Manager Access ── */}
                        <div className="mb-6">
                            <FieldLabel text="Additional Access" Icon={ShieldCheck} />
                            <div
                                className="flex items-center gap-3 mt-2 p-3.5 rounded-xl cursor-pointer select-none transition-all duration-200"
                                style={{
                                    border: formData.hasManagerAccess
                                        ? `1px solid rgba(45,42,119,0.25)`
                                        : "1px solid #E5E7EB",
                                    background: formData.hasManagerAccess
                                        ? `rgba(45,42,119,0.04)`
                                        : "rgba(249,250,251,0.8)",
                                }}
                                onClick={() =>
                                    patch("hasManagerAccess", !formData.hasManagerAccess)
                                }
                            >
                                {/* Custom styled checkbox */}
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                    style={{
                                        border: formData.hasManagerAccess
                                            ? "none"
                                            : `2px solid #D1D5DB`,
                                        background: formData.hasManagerAccess
                                            ? `linear-gradient(135deg, ${ORANGE}, ${VIOLET})`
                                            : "white",
                                        boxShadow: formData.hasManagerAccess
                                            ? `0 2px 8px rgba(45,42,119,0.3)`
                                            : "none",
                                    }}
                                >
                                    {formData.hasManagerAccess && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span
                                        className="text-[12px] font-semibold tracking-wide"
                                        style={{
                                            color: formData.hasManagerAccess
                                                ? VIOLET
                                                : "#6B7280",
                                        }}
                                    >
                                        Grant Manager Access
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        Allows staff to access management portal and team operations
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Security Section ── */}
                        <div className="mb-6">
                            <FieldLabel text="Initial Access Key" Icon={Lock} />
                            <div className="relative mt-2">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••"
                                    value={formData.password}
                                    onChange={(e) =>
                                        patch("password", e.target.value)
                                    }
                                    className="w-full h-11 pl-4 pr-12 text-sm rounded-xl transition-all duration-300 outline-none font-mono"
                                    style={{
                                        border: "1px solid #E5E7EB",
                                        background: "rgba(255,255,255,0.9)",
                                        color: "#111827",
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor =
                                            VIOLET;
                                        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(45,42,119,0.12)`;
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "#E5E7EB";
                                        e.currentTarget.style.boxShadow =
                                            "none";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((s) => !s)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {/* Custom checkbox */}
                            <div
                                className="flex items-center gap-3 mt-4 p-3.5 rounded-xl cursor-pointer select-none transition-all duration-200"
                                style={{
                                    border: formData.requireReset
                                        ? `1px solid rgba(45,42,119,0.25)`
                                        : "1px solid #E5E7EB",
                                    background: formData.requireReset
                                        ? `rgba(45,42,119,0.04)`
                                        : "rgba(249,250,251,0.8)",
                                }}
                                onClick={() =>
                                    patch("requireReset", !formData.requireReset)
                                }
                            >
                                {/* Custom styled checkbox */}
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                    style={{
                                        border: formData.requireReset
                                            ? "none"
                                            : `2px solid #D1D5DB`,
                                        background: formData.requireReset
                                            ? `linear-gradient(135deg, ${ORANGE}, ${VIOLET})`
                                            : "white",
                                        boxShadow: formData.requireReset
                                            ? `0 2px 8px rgba(45,42,119,0.3)`
                                            : "none",
                                    }}
                                >
                                    {formData.requireReset && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <span
                                    className="text-[12px] font-semibold tracking-wide"
                                    style={{
                                        color: formData.requireReset
                                            ? VIOLET
                                            : "#6B7280",
                                    }}
                                >
                                    Require password reset on first login
                                </span>
                            </div>
                        </div>

                        {/* ── Action Buttons ── */}
                        <div
                            className="flex items-center justify-between pt-5"
                            style={{
                                borderTop: "1px solid rgba(229,231,235,0.8)",
                            }}
                        >
                            <DialogClose asChild>
                                <button
                                    type="button"
                                    className="h-11 px-6 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all duration-300"
                                    style={{ color: "#9CA3AF" }}
                                    onMouseEnter={(e) => {
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.color = VIOLET;
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.background =
                                            "rgba(45,42,119,0.06)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.color = "#9CA3AF";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.background = "transparent";
                                    }}
                                >
                                    Cancel
                                </button>
                            </DialogClose>

                            <button
                                type="submit"
                                disabled={loading}
                                className="relative h-11 px-7 rounded-xl text-[12px] font-black uppercase tracking-widest text-white flex items-center gap-2.5 overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    background: `linear-gradient(135deg, ${ORANGE}, ${VIOLET})`,
                                    boxShadow: `0 4px 20px rgba(241,90,36,0.35), 0 2px 8px rgba(45,42,119,0.25)`,
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.boxShadow = `0 6px 28px rgba(241,90,36,0.55), 0 3px 14px rgba(45,42,119,0.4)`;
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.transform = "translateY(-1px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.boxShadow = `0 4px 20px rgba(241,90,36,0.35), 0 2px 8px rgba(45,42,119,0.25)`;
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.transform = "translateY(0)";
                                }}
                            >
                                {/* Shimmer overlay */}
                                <span
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background:
                                            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                                        backgroundSize: "200% 100%",
                                        animation:
                                            "shimmer 2.5s ease-in-out infinite",
                                    }}
                                />
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                                ) : (
                                    <UserPlus className="h-4 w-4 relative z-10" />
                                )}
                                <span className="relative z-10">
                                    {loading
                                        ? "Deploying..."
                                        : "Initialize Access"}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Shimmer keyframes — injected once */}
                <style>{`
                    @keyframes shimmer {
                        0%   { background-position: -200% center; }
                        100% { background-position:  200% center; }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FieldLabel({
    text,
    Icon,
}: {
    text: string;
    Icon?: React.ElementType;
}) {
    return (
        <label
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] mb-0"
            style={{ color: "#6B7280" }}
        >
            {Icon && <Icon className="w-3 h-3" />}
            {text}
        </label>
    );
}

function FieldBox({
    id,
    label,
    Icon,
    type = "text",
    placeholder,
    value,
    onChange,
}: {
    id: string;
    label: string;
    Icon: React.ElementType;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <FieldLabel text={label} Icon={Icon} />
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 px-4 text-sm rounded-xl transition-all duration-300 outline-none w-full"
                style={{
                    border: "1px solid #E5E7EB",
                    background: "rgba(255,255,255,0.9)",
                    color: "#111827",
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2D2A77";
                    e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(45,42,119,0.12)";
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.boxShadow = "none";
                }}
            />
        </div>
    );
}
