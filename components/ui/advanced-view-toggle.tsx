"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, BarChart3, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedViewToggleProps {
  isAdvanced: boolean;
  onToggle: (advanced: boolean) => void;
  className?: string;
}

export function AdvancedViewToggle({ isAdvanced, onToggle, className }: AdvancedViewToggleProps) {
  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center gap-3 px-4 py-2 rounded-full",
        "bg-gradient-to-r from-slate-100 to-gray-100",
        "border border-gray-200 shadow-sm",
        "transition-all duration-300",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon with animation */}
      <motion.div
        animate={{
          rotate: isAdvanced ? 180 : 0,
          scale: isAdvanced ? 1.1 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isAdvanced ? (
          <BarChart3 className="w-4 h-4 text-indigo-600" />
        ) : (
          <Eye className="w-4 h-4 text-gray-600" />
        )}
      </motion.div>

      {/* Label */}
      <motion.span
        className={cn(
          "text-sm font-medium transition-colors duration-300",
          isAdvanced ? "text-indigo-600" : "text-gray-600"
        )}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isAdvanced ? "Advanced View" : "Standard View"}
      </motion.span>

      {/* Toggle Switch */}
      <motion.button
        onClick={() => onToggle(!isAdvanced)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors duration-300",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          isAdvanced ? "bg-indigo-600" : "bg-gray-300"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Toggle Thumb */}
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
          animate={{
            x: isAdvanced ? 25 : 5,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {/* Glow effect when active */}
        {isAdvanced && (
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-400 opacity-30"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Subtle particles effect when toggling */}
      {isAdvanced && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400 rounded-full"
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              style={{
                top: `${20 + Math.sin(i * 60) * 15}%`,
                left: `${20 + Math.cos(i * 60) * 15}%`,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
