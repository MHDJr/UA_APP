import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { FocusProvider } from "@/lib/focus-context";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStatusProvider } from "@/components/network-status-provider";
import { TabResiliencyEngine } from "@/components/tab-resiliency-engine";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SyncWrapper } from "@/components/sync-wrapper";

export const metadata: Metadata = {
    title: "Usthad Academy - Executive Command",
    description: "Cyber-Enhanced CEO Command Center for Usthad Academy",
    manifest: "/manifest.json",
    themeColor: "#030712",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "UA Command",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full overflow-hidden">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              try {
                const storedTheme = localStorage.getItem("ceo-dashboard-theme");
                if (storedTheme === "dark") {
                  document.documentElement.setAttribute("data-theme", "dark");
                } else {
                  document.documentElement.removeAttribute("data-theme");
                }
              } catch (e) {}
            `,
                    }}
                />
            </head>
            <body 
                className="font-sans h-full max-h-full w-full max-w-full overflow-hidden bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground"
            >
                <ErrorBoundary>
                    <NetworkStatusProvider>
                        <ThemeProvider>
                            <FocusProvider>
                                <QueryProvider>
                                    <SyncWrapper>
                                        <AuthProvider>
                                            <TabResiliencyEngine>
                                                {children}
                                                <MobileBottomNav />
                                            </TabResiliencyEngine>
                                            <Toaster
                                                position="top-right"
                                                theme="dark"
                                                toastOptions={{
                                                    className:
                                                        "border-primary/20 bg-card/80 backdrop-blur-md text-foreground",
                                                }}
                                            />
                                        </AuthProvider>
                                    </SyncWrapper>
                                </QueryProvider>
                            </FocusProvider>
                        </ThemeProvider>
                    </NetworkStatusProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
