"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { ApiDebug } from "@/components/api-debug"
import { AuthProvider } from "@/contexts/auth-context"
import { DebugPanel } from "@/components/debug-panel"
import { MapProvider } from "@/contexts/map-context"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <MapProvider>
                <AuthProvider>
                    {children}
                    <ApiDebug />
                    <DebugPanel />
                </AuthProvider>
            </MapProvider>
        </ThemeProvider>
    )
} 