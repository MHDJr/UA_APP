import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ['"Inter"', "sans-serif"],
                mono: ['"JetBrains Mono"', "monospace"],
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                
                // Theme System (Light/Dark matching)
                "theme-bg": "var(--theme-bg)",
                "theme-card": "var(--theme-card)",
                "theme-text": "var(--theme-text)",
                "theme-text-80": "var(--theme-text-80)",
                "theme-text-60": "var(--theme-text-60)",
                "theme-text-50": "var(--theme-text-50)",
                "theme-text-40": "var(--theme-text-40)",
                "theme-text-30": "var(--theme-text-30)",
                "theme-text-20": "var(--theme-text-20)",
                "theme-text-10": "var(--theme-text-10)",
                "theme-border-40": "var(--theme-border-40)",
                "theme-border-20": "var(--theme-border-20)",
                "theme-border-10": "var(--theme-border-10)",
                "theme-border-5": "var(--theme-border-5)",
                "theme-bg-white": "var(--theme-bg-white)",
                "theme-bg-white-90": "var(--theme-bg-white-90)",
                "theme-bg-white-80": "var(--theme-bg-white-80)",
                "theme-bg-white-20": "var(--theme-bg-white-20)",
                "theme-bg-white-10": "var(--theme-bg-white-10)",
                "theme-bg-white-5": "var(--theme-bg-white-5)",
                "theme-inv-text": "var(--theme-inv-text)",
                "theme-nav-bg": "var(--theme-nav-bg)",
                "theme-brand": "var(--theme-brand)",
                "theme-hover-brand-bg": "var(--theme-hover-brand-bg)",
                "theme-hover-accent-bg": "var(--theme-hover-accent-bg)",

                // Executive Palette - Black, Charcoal, Muted Gold
                "exec-black": "#0a0a0a",
                "exec-charcoal": "#141414",
                "exec-charcoal-light": "#1f1f1f",
                "exec-charcoal-muted": "#2a2a2a",
                "exec-gold": "#c9a227",
                "exec-gold-dim": "#8b7120",
                "exec-gold-bright": "#d4af37",
                "exec-success": "#22c55e",
                "exec-alert": "#ef4444",
                "exec-warning": "#f59e0b",

                // Usthad Academy Brand Palette
                "brand-primary": "#2F1E73",
                "brand-orange": "#FA4616",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "executive-fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "subtle-slide-up": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "executive-fade-in": "executive-fade-in 0.5s ease-out forwards",
                "subtle-slide-up": "subtle-slide-up 0.4s ease-out forwards",
                "spin-slow": "spin 3s linear infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
