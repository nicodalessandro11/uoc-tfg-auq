"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }
        try {
            console.log("Antes de updateUser", { password })
            const { error, data, user } = await supabase.auth.updateUser({ password })
            console.log("Después de updateUser", { error, data, user })
            if (error) {
                setError(error.message)
            } else {
                setSuccess(true)
                setTimeout(() => router.push("/login"), 2000)
            }
        } catch (err: any) {
            console.error("Error en reset-password handleSubmit:", err)
            setError(err.message || "Unexpected error")
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-4">Reset your password</h2>
                {success ? (
                    <div className="text-green-600 mb-4">
                        Password updated! Redirecting to login...
                    </div>
                ) : (
                    <>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2 mb-2"
                            placeholder="New password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2 mb-4"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {error && <div className="text-red-600 mb-2">{error}</div>}
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-2 rounded"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update password"}
                        </button>
                    </>
                )}
            </form>
        </div>
    )
}