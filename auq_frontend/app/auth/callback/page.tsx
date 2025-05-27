"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const urlError = searchParams.get("error")
        const errorCode = searchParams.get("error_code")
        if (urlError === "access_denied" && errorCode === "otp_expired") {
            setError("The confirmation link is invalid or has expired. Please sign up again or request a new confirmation email.")
            return
        }
        const access_token = searchParams.get("access_token")
        const refresh_token = searchParams.get("refresh_token")
        if (access_token && refresh_token) {
            supabase.auth.setSession({ access_token, refresh_token })
                .then(({ error }) => {
                    if (error) {
                        setError("Error confirming your email. Please try logging in.")
                    } else {
                        router.replace("/dashboard")
                    }
                })
        } else if (urlError) {
            setError("Authentication error: " + urlError.replace(/_/g, " "))
        } else {
            setError("Invalid or missing confirmation tokens.")
        }
    }, [searchParams, router])

    if (error) {
        return (
            <div className="text-center mt-8">
                <div className="text-red-600 mb-4">{error}</div>
                <a href="/signup" className="text-blue-600 underline">Sign up again</a>
            </div>
        )
    }
    return <div className="text-center mt-8">Confirming your email, please wait...</div>
} 