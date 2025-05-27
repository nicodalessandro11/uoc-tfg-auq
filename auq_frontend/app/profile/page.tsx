"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertProfile } from "@/lib/supabase-client"
import { ArrowLeft } from "lucide-react"

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
    const router = useRouter()
    const [editName, setEditName] = useState(false)
    const [displayName, setDisplayName] = useState(user?.display_name || "")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/")
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        setDisplayName(user?.display_name || "")
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (user) {
                await upsertProfile({ user_id: user.id, display_name: displayName })
                await refreshUser()
            }
            setEditName(false)
        } catch (err) {
            // Optionally show error
        } finally {
            setSaving(false)
        }
    }

    if (isLoading || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Button>
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold mb-4">
                    {(user?.display_name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="text-2xl font-semibold mb-2">{user?.display_name || "User"}</div>
                <div className="text-muted-foreground mb-6">{user?.email}</div>

                {/* Edit display name */}
                <div className="w-full mb-6">
                    {editName ? (
                        <form className="flex gap-2" onSubmit={handleSave}>
                            <Input
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                className="flex-1"
                                disabled={saving}
                            />
                            <Button type="submit" disabled={saving || !displayName.trim()}>
                                {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setEditName(false)} disabled={saving}>
                                Cancel
                            </Button>
                        </form>
                    ) : (
                        <Button variant="outline" onClick={() => setEditName(true)} className="w-full">
                            Edit Name
                        </Button>
                    )}
                </div>

                <div className="w-full flex flex-col gap-3">
                    <Button variant="secondary" disabled>
                        Change Email (coming soon)
                    </Button>
                    <Button variant="secondary" disabled>
                        Change Password (coming soon)
                    </Button>
                </div>
            </div>
        </div>
    )
} 