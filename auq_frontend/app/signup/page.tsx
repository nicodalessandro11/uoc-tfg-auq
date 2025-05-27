"use client"

import React, { useState } from "react"

export default function SignUpPage() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const isPasswordValid = password.length >= 6
    const doPasswordsMatch = password === confirmPassword
    const isFormValid = username && email && isPasswordValid && doPasswordsMatch

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        setLoading(true)
        try {
            // Dynamic import to avoid SSR issues
            const { supabase } = await import("@/lib/supabase-client")
            if (!supabase) throw new Error("Supabase client not available")

            // 0. Check if username is unique
            const { data: existing, error: checkError } = await supabase
                .from("profiles")
                .select("user_id")
                .eq("display_name", username)
                .maybeSingle()
            if (checkError) throw checkError
            if (existing) {
                setError("Username is already taken. Please choose another.")
                setLoading(false)
                return
            }

            // 1. Sign up user with metadata
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: username
                    }
                }
            })
            if (signUpError) throw signUpError
            if (!data.user) throw new Error("User not created. Please check your email to confirm your account.")

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <img src="/mascot-blue.svg" alt="Queryous" className="w-20 h-20 mx-auto mb-4 bg-blue-600 p-2 rounded-full" />
                <h1 className="text-2xl font-bold mb-6 text-center">Are u query-ous?</h1>
                <h2 className="text-lg font-bold mb-6 text-center">Your query journey starts here. Join us!</h2>
                {success ? (
                    <div className="text-green-600 text-center mb-4">
                        Account created! Please check your email to confirm your account.
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        {error && <div className="text-red-600 text-center">{error}</div>}
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
                            disabled={!isFormValid || loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
} 