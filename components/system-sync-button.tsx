"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SystemSyncButtonProps {
  variant?: "icon" | "full";
  className?: string;
}

export function SystemSyncButton({ variant = "icon", className }: SystemSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSystemSync = async () => {
    setIsSyncing(true);
    setShowConfirm(false);

    try {
      // Clear localStorage
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach((key) => {
        // Preserve auth-related data if needed
        if (!key.includes("sb-")) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear caches if available
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        } catch (e) {
          console.warn("Cache clearing failed:", e);
        }
      }

      // Show success toast
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-sm">Intelligence Recalibrated</p>
            <p className="text-xs text-white/60">System optimized successfully</p>
          </div>
        </div>,
        { duration: 3000 }
      );

      // Brief delay before reload to show the success state
      setTimeout(() => {
        // Force reload with cache bypass
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("System sync failed:", error);
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-sm">Calibration Failed</p>
            <p className="text-xs text-white/60">Please try again</p>
          </div>
        </div>
      );
      setIsSyncing(false);
    }
  };

  const buttonContent = (
    <>
      <motion.div
        animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
        transition={isSyncing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
      >
        <RefreshCw className="w-4 h-4" />
      </motion.div>
      {variant === "full" && <span className="ml-2">Re-Sync Intelligence</span>}
    </>
  );

  return (
    <>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogTrigger asChild>
          {variant === "icon" ? (
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 group ${className}`}
              disabled={isSyncing}
            >
              {buttonContent}
              <span className="sr-only">Re-Sync Intelligence</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className={`gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 ${className}`}
              disabled={isSyncing}
            >
              {buttonContent}
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              Re-Sync Intelligence?
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 pt-2">
              This will clear all cached data, local storage, and reload the dashboard with the latest intelligence feed.
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Clear temporary cache files
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Reset dashboard preferences
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Reload from latest server state
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSystemSync}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Confirm Sync
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
