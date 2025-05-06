"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, BarChart2, Settings, Diff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full modern-header">
      <div className="flex h-16 items-center px-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground md:hidden"></Button>
          <Link href="/" className="flex items-center gap-2">
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
            <Link href="/">
              <Button variant="ghost" className={`text-primary-foreground ${pathname === "/" ? "bg-white/10" : ""}`}>
                <MapPin className="mr-2 h-5 w-5" />
                Map
              </Button>
            </Link>
            <Link href="/compare">
              <Button
                variant="ghost"
                className={`text-primary-foreground ${pathname === "/compare" ? "bg-white/10" : ""}`}
              >
                <Diff strokeWidth={2} className="mr-2 h-5 w-5" />
                Compare
              </Button>
            </Link>
            <Link href="/visualize">
              <Button
                variant="ghost"
                className={`text-primary-foreground ${pathname === "/visualize" ? "bg-white/10" : ""}`}
              >
                <BarChart2 strokeWidth={3} className="mr-2 h-5 w-5" />
                Visualize
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                className={`text-primary-foreground ${pathname === "/admin" ? "bg-white/10" : ""}`}
              >
                <Settings strokeWidth={2} className="mr-2 h-5 w-5" />
                Admin
              </Button>
            </Link>
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
            <DropdownMenuContent align="end">
              <Link href="/">
                <DropdownMenuItem className="cursor-pointer">Map</DropdownMenuItem>
              </Link>
              <Link href="/compare">
                <DropdownMenuItem className="cursor-pointer">
                  <Diff className="mr-2 h-4 w-4" />
                  Compare
                </DropdownMenuItem>
              </Link>
              <Link href="/visualize">
                <DropdownMenuItem className="cursor-pointer">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Visualize
                </DropdownMenuItem>
              </Link>
              <Link href="/admin">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
