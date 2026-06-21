"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
    Loader2, 
    AlertTriangle, 
    Lock, 
    Eye, 
    EyeOff, 
    Fingerprint, 
    ShieldCheck, 
    ChevronRight,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MobileAuthPage() {
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [signInForm, setSignInForm] = useState({
        username: "",
        password: "",
        rememberMe: false,
    });
    const [accessDenied, setAccessDenied] = useState(false);
    const [wrongCredentials, setWrongCredentials] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const denied = window.localStorage.getItem("ACCESS_DENIED");
            if (denied === "true") {
                setAccessDenied(true);
                window.localStorage.removeItem("ACCESS_DENIED");
                toast.error("UNAUTHORIZED ACCESS DETECTED", {
                    description: "Your account is not registered or approved for this academy.",
                    duration: 10000,
                });
            }

            const savedUsername = window.localStorage.getItem("REMEMBER_ME_USERNAME");
            const rememberMe = window.localStorage.getItem("REMEMBER_ME_CHECKED");
            if (savedUsername && rememberMe === "true") {
                setSignInForm((prev) => ({
                    ...prev,
                    username: savedUsername,
                    rememberMe: true,
                }));
            }
        }
    }, []);

    const triggerHaptic = (type: "light" | "medium" | "warning") => {
        if (typeof window !== "undefined" && navigator.vibrate) {
            if (type === "light") navigator.vibrate(10);
            else if (type === "medium") navigator.vibrate(20);
            else if (type === "warning") navigator.vibrate([30, 50, 30]);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        triggerHaptic("medium");

        if (signInForm.rememberMe) {
            window.localStorage.setItem("REMEMBER_ME_USERNAME", signInForm.username);
            window.localStorage.setItem("REMEMBER_ME_CHECKED", "true");
        } else {
            window.localStorage.removeItem("REMEMBER_ME_USERNAME");
            window.localStorage.setItem("REMEMBER_ME_CHECKED", "false");
        }

        try {
            const input = signInForm.username.trim();
            const isEmail = input.includes("@");
            if (isEmail) {
                await signIn(input, signInForm.password);
            } else {
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("email")
                    .ilike("username", input)
                    .maybeSingle();
                if (error || !profile) {
                    throw new Error(
                        error
                            ? "System error during identity verification"
                            : "User not found with this username"
                    );
                }
                await signIn(profile.email, signInForm.password);
            }
            toast.success("Identity verified. Initializing secure session...");
        } catch (error: any) {
            triggerHaptic("warning");
            if (error.message?.includes("Invalid login credentials") || error.status === 400) {
                setWrongCredentials(true);
                setAccessDenied(false);
                toast.error("SECURITY ALERT: WRONG CREDENTIALS", {
                    description: "Authorization failed. Please verify your identity.",
                    duration: 5000,
                });
            } else {
                setAccessDenied(true);
                setWrongCredentials(false);
                toast.error("SECURITY ALERT: ACCESS DENIED", {
                    description: error.message || "Failed to sign in",
                    duration: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        triggerHaptic("medium");
        try {
            await supabase.auth.signOut();
            await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: { access_type: "offline", prompt: "consent" },
                },
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in with Google.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
            {/* Glowing Brand Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#31267D] opacity-10 dark:opacity-20 blur-[60px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#FA4616] opacity-10 dark:opacity-20 blur-[60px]" />

            <div className="w-full max-w-sm p-6 rounded-[2.5rem] bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-zinc-800/80 shadow-xl flex flex-col gap-6 relative z-10">
                
                {/* Brand header */}
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 p-2.5 bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800/80 rounded-2xl shadow-sm flex items-center justify-center">
                        <img 
                            src="/images/usthadacademylogo2.svg" 
                            alt="Academy Logo" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center justify-center gap-1.5 leading-none">
                            AcademyOS <Sparkles className="w-4 h-4 text-[#FA4616]" />
                        </h2>
                        <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Mobile Access Terminal</span>
                    </div>
                </div>

                {/* Form Security Alert Box */}
                {(accessDenied || wrongCredentials) && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 flex gap-2.5 items-start">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider">Access Restricted</span>
                            <span className="text-[8px] font-bold text-rose-500 dark:text-rose-400/80 uppercase tracking-tight">Credentials mismatch. Terminal authorization failed.</span>
                        </div>
                    </div>
                )}

                {/* Login Inputs */}
                <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Identity Code / Username</label>
                        <input 
                            type="text"
                            placeholder="username or email"
                            value={signInForm.username}
                            onChange={(e) => setSignInForm({ ...signInForm, username: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800/80 rounded-2xl text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#FA4616]"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Access Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="password secret"
                                value={signInForm.password}
                                onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                                className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800/80 rounded-2xl text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#FA4616]"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Trust switch remember me */}
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    triggerHaptic("light");
                                    setSignInForm({ ...signInForm, rememberMe: !signInForm.rememberMe });
                                }}
                                className="relative w-8 h-5 rounded-full transition-all duration-300 cursor-pointer shrink-0 border border-slate-200/50 dark:border-zinc-800"
                            >
                                <div className={cn(
                                    "absolute inset-0 rounded-full transition-all duration-300",
                                    signInForm.rememberMe ? "bg-[#FA4616]" : "bg-slate-200 dark:bg-zinc-850"
                                )} />
                                <div className={cn(
                                    "absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm",
                                    signInForm.rememberMe ? "translate-x-3.5" : ""
                                )} />
                            </button>
                            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Trust this workstation</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FA4616] to-[#31267D] text-white font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-95 transition-all cursor-pointer border-none"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Initiate Session</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-2.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-850 text-[8px] font-black text-zinc-550 dark:text-zinc-450 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            <span>Google Access Link</span>
                        </button>
                    </div>
                </form>

                {/* Biometrics mockup */}
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-850/50 flex items-center justify-between opacity-50 hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border border-slate-200/50 dark:border-zinc-800 flex items-center justify-center text-[#FA4616] bg-slate-50 dark:bg-zinc-950 shadow-inner">
                            <Fingerprint className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-widest leading-none mb-0.5">Biometrics Ready</span>
                            <span className="text-[7px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tight leading-none">Security clearance port</span>
                        </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-slate-200 dark:text-zinc-800" />
                </div>
            </div>

            <footer className="absolute bottom-4 left-0 w-full text-center px-4 pointer-events-none">
                <p className="text-[7.5px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.4em]">
                    Proprietary Administrative System © 2026 USTHAD ACADEMY
                </p>
            </footer>
        </div>
    );
}
