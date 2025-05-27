"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { MapPin, BarChart2, Settings, Diff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { UserLoginModal } from "@/components/user-login-modal"
import { useAuth } from "@/contexts/auth-context"

function useEnabledFeatures() {
  const [enabledFeatures, setEnabledFeatures] = useState({ map: true, compare: true, visualize: true })

  useEffect(() => {
    function update() {
      const stored = localStorage.getItem('enabledFeatures')
      if (stored) {
        setEnabledFeatures(JSON.parse(stored))
      }
    }
    update()
    window.addEventListener('storage', update)
    window.addEventListener('enabledFeaturesChanged', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('enabledFeaturesChanged', update)
    }
  }, [])

  return enabledFeatures
}

export function Header() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const enabledFeatures = useEnabledFeatures()
  const { user, logout, isAuthenticated, isLoading, login } = useAuth()
  console.log("[Header] Auth user:", user)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const handleLogout = async () => {
    await logout()
    // Limpiar localStorage
    localStorage.removeItem('enabledFeatures')
    localStorage.removeItem('disabledIndicators')
    // Refrescar la página
    window.location.href = '/'
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password")
      setLoginLoading(false)
      return
    }
    try {
      const result = await login(loginEmail, loginPassword)
      if (!result.success) {
        setLoginError(result.error || "Login failed")
        setLoginLoading(false)
        return
      }
      // Reset form and close modal
      setLoginEmail("")
      setLoginPassword("")
      setShowLoginModal(false)
      setLoginError(null)
    } catch (err: any) {
      setLoginError(err.message || "An unexpected error occurred")
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full modern-header">
      <div className="flex h-16 items-center px-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground md:hidden"></Button>
          <Link href={`/${queryString ? "?" + queryString : ""}`} className="flex items-center gap-2">
            <div>
              <img src="/mascot-blue.svg" alt="Mascot" className="h-14 w-14" />
            </div>
            <span className="text-lg font-semibold">Are u query-ous?</span>
          </Link>
        </div>

        {/* RIGHT */}
        {/* Navigation Links - Hidden on mobile */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden md:flex items-center ml-8 space-x-1">
            <ModeToggle />
            {enabledFeatures.map && (
              <Link href={`/${queryString ? "?" + queryString : ""}`}>
                <Button variant="ghost" className={`text-primary-foreground ${pathname === "/" ? "bg-white/10" : ""}`}>
                  <MapPin className="mr-2 h-5 w-5" />
                  Map
                </Button>
              </Link>
            )}
            {enabledFeatures.compare && (
              <Link href={`/compare${queryString ? "?" + queryString : ""}`}>
                <Button
                  variant="ghost"
                  className={`text-primary-foreground ${pathname === "/compare" ? "bg-white/10" : ""}`}
                >
                  <Diff strokeWidth={2} className="mr-2 h-5 w-5" />
                  Compare
                </Button>
              </Link>
            )}
            {enabledFeatures.visualize && (
              <Link href={`/visualize${queryString ? "?" + queryString : ""}`}>
                <Button
                  variant="ghost"
                  className={`text-primary-foreground ${pathname === "/visualize" ? "bg-white/10" : ""}`}
                >
                  <BarChart2 strokeWidth={3} className="mr-2 h-5 w-5" />
                  Visualize
                </Button>
              </Link>
            )}
            {user?.is_admin && (
              <Link href={`/admin${queryString ? "?" + queryString : ""}`}>
                <Button
                  variant="ghost"
                  className={`text-primary-foreground ${pathname === "/admin" ? "bg-white/10" : ""}`}
                >
                  <Settings strokeWidth={2} className="mr-2 h-5 w-5" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* TODO: Mobile Navigation Menu */}
        <div className="md:hidden ml-auto mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-primary-foreground">
                Navigate
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[2147483647] fixed">
              {enabledFeatures.map && (
                <Link href={`/${queryString ? "?" + queryString : ""}`}>
                  <DropdownMenuItem className="cursor-pointer">Map</DropdownMenuItem>
                </Link>
              )}
              {enabledFeatures.compare && (
                <Link href={`/compare${queryString ? "?" + queryString : ""}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Diff className="mr-2 h-4 w-4" />
                    Compare
                  </DropdownMenuItem>
                </Link>
              )}
              {enabledFeatures.visualize && (
                <Link href={`/visualize${queryString ? "?" + queryString : ""}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Visualize
                  </DropdownMenuItem>
                </Link>
              )}
              <Link href={`/admin${queryString ? "?" + queryString : ""}`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2 ml-2">
            {isLoading ? (
              <div style={{ width: 120, height: 40 }} />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1 rounded bg-white/10 focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {(user.display_name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-primary-foreground">
                      {user.display_name || "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent align="end" className="z-[2147483647] fixed right-0">
                    <DropdownMenuItem asChild>
                      <a href="/profile">Profile</a>
                    </DropdownMenuItem>
                    {user?.is_admin !== true && (
                      <DropdownMenuItem asChild>
                        <a href="/config">Configuration</a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="activeNav" onClick={() => setShowLoginModal(true)}>Sign In</Button>
                <UserLoginModal
                  isOpen={showLoginModal}
                  onClose={() => setShowLoginModal(false)}
                  error={loginError}
                  isLoading={loginLoading}
                  email={loginEmail}
                  password={loginPassword}
                  setEmail={setLoginEmail}
                  setPassword={setLoginPassword}
                  onSubmit={handleLoginSubmit}
                />
                <Link href="/signup" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
