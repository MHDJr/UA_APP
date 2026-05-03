"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Activity, Shield, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRecovering: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, isRecovering: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AcademyOS Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ isRecovering: true });
    
    // Clear localStorage
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Error clearing localStorage:", e);
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing sessionStorage:", e);
    }

    // Attempt to clear caches if available
    if ("caches" in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }

    // Reset error state and reload
    setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: null, isRecovering: false });
      window.location.reload();
    }, 1500);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4"
          >
            <div className="max-w-2xl w-full">
              {/* Main Error Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  {/* Status Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-2 mb-8"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                      <Activity className="w-4 h-4 text-red-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                        System Exception Detected
                      </span>
                    </div>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="flex justify-center mb-8"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl shadow-orange-500/25">
                        <Shield className="w-12 h-12 text-white" />
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-2 border-2 border-dashed border-white/10 rounded-3xl"
                      />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl md:text-4xl font-black text-center text-white mb-4 tracking-tight"
                  >
                    System Recovering
                  </motion.h1>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-white/60 text-lg mb-8 max-w-md mx-auto leading-relaxed"
                  >
                    AcademyOS has encountered an unexpected interruption. Our intelligence protocols are automatically restoring system integrity.
                  </motion.p>

                  {/* Error Details (Collapsible) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                  >
                    <details className="group">
                      <summary className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/60 cursor-pointer transition-colors">
                        <Cpu className="w-4 h-4" />
                        <span>View Technical Diagnostics</span>
                      </summary>
                      <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/5 font-mono text-xs text-white/50 overflow-auto max-h-48">
                        <p className="text-red-400 mb-2">
                          {this.state.error?.name}: {this.state.error?.message}
                        </p>
                        <p className="whitespace-pre-wrap">
                          {this.state.errorInfo?.componentStack}
                        </p>
                      </div>
                    </details>
                  </motion.div>

                  {/* Recovery Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={this.handleReset}
                      disabled={this.state.isRecovering}
                      className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-lg px-8 py-6 h-auto rounded-xl shadow-xl shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {this.state.isRecovering ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Recalibrating Intelligence...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            <span>Re-Sync Intelligence</span>
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 pt-6 border-t border-white/5 text-center"
                  >
                    <p className="text-xs text-white/30 uppercase tracking-widest">
                      AcademyOS Executive Command Center
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}
