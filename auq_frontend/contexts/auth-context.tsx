"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Types for our auth context
type User = {
  id: string
  email: string
  name?: string
  role: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  supabase: SupabaseClient | null
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for development
const MOCK_USER: User = {
  id: "mock-user-id",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
}

// Mock credentials for development
const MOCK_CREDENTIALS = {
  email: "admin@example.com",
  password: "password123",
}

// Environment flag to determine if we're using mock data
const USE_MOCK_AUTH = true

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  // Initialize Supabase client
  useEffect(() => {
    try {
      // Initialize the Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      // Handle both possible environment variable names (full and truncated)
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      if (supabaseUrl && supabaseKey && !USE_MOCK_AUTH) {
        const client = createClient(supabaseUrl, supabaseKey)
        setSupabase(client)

        // Check for existing session
        const checkSession = async () => {
          const { data } = await client.auth.getSession()
          if (data.session) {
            const { data: userData } = await client.auth.getUser()
            if (userData.user) {
              setUser({
                id: userData.user.id,
                email: userData.user.email || "",
                role: "admin", // You would get this from your user metadata or a separate query
              })
            }
          }
          setIsLoading(false)
        }

        checkSession()
      } else {
        // Using mock auth
        // Check if we have a mock session in localStorage
        const mockSession = localStorage.getItem("mockAuthSession")
        if (mockSession === "authenticated") {
          setUser(MOCK_USER)
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error initializing auth:", error)
      setIsLoading(false)
    }
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      if (USE_MOCK_AUTH) {
        // Mock authentication
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay

        if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
          setUser(MOCK_USER)
          localStorage.setItem("mockAuthSession", "authenticated")
          setIsLoading(false)
          return { success: true }
        } else {
          setIsLoading(false)
          return { success: false, error: "Invalid email or password" }
        }
      } else if (supabase) {
        // Real Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setIsLoading(false)
          return { success: false, error: error.message }
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || "",
            role: "admin", // You would get this from your user metadata or a separate query
          })
          setIsLoading(false)
          return { success: true }
        }
      }

      setIsLoading(false)
      return { success: false, error: "Authentication failed" }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)

    try {
      if (USE_MOCK_AUTH) {
        // Mock logout
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
        localStorage.removeItem("mockAuthSession")
        setUser(null)
      } else if (supabase) {
        // Real Supabase logout
        await supabase.auth.signOut()
        setUser(null)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
