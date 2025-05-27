"use client"

import { useState, useEffect } from "react"
import { MapProvider } from "@/contexts/map-context"
import { Header } from "@/components/header"
import { ConfigView } from "@/components/config-view"
import { LoginModal } from "@/components/login-modal"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Show login modal if not authenticated
    if (!isLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <MapProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {isAuthenticated ? (
            <ConfigView />
          ) : (
            <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
                <p className="text-muted-foreground mb-4">You need to be logged in to access the admin dashboard.</p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </main>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </div>
    </MapProvider>
  )
}
