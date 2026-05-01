"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const handleThemeToggle = () => {
        const targetTheme = theme === "light" ? "dark" : "light";
        setTheme(targetTheme);
    };

    return (
        <Button
            variant="ghost"
            onClick={handleThemeToggle}
            className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-2 bg-theme-nav-bg border border-theme-border-10 hover:border-theme-border-20 hover:bg-theme-bg-white-5 rounded-full transition-all duration-300 shadow-sm theme-transition-element"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
            <Sun
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${theme === "light" ? "text-amber-500" : "text-theme-text-30"}`}
            />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-theme-text-60 whitespace-nowrap hidden sm:inline">
                {theme === "light" ? "LIGHT" : "DARK"}
            </span>
            <Moon
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${theme === "dark" ? "text-indigo-400" : "text-theme-text-30"}`}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
