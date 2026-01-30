'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function AdminLoginPage() {
    const { signInWithGoogle, user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = React.useState<string | null>(null)
    const [checking, setChecking] = React.useState(false)

    React.useEffect(() => {
        if (user) {
            checkAdminAccess()
        }
    }, [user])

    const checkAdminAccess = async () => {
        if (!user) return
        
        setChecking(true)
        try {
            // Check if user has admin access to any organization
            const response = await fetch(`/api/organizations/my-organizations?userId=${user.uid}`)
            if (response.ok) {
                const orgs = await response.json()
                if (orgs.length > 0) {
                    // User has admin access, redirect to intended page or admin dashboard
                    const returnUrl = searchParams.get('returnUrl') || '/admin'
                    router.push(returnUrl)
                } else {
                    setError('You do not have admin access. Please contact your organization administrator.')
                }
            } else {
                setError('Unable to verify admin access. Please try again.')
            }
        } catch (err) {
            console.error('Error checking admin access:', err)
            setError('An error occurred. Please try again.')
        } finally {
            setChecking(false)
        }
    }

    const handleLogin = async () => {
        try {
            setError(null)
            await signInWithGoogle()
            // checkAdminAccess will be called by useEffect when user is set
        } catch (err: any) {
            setError('Failed to sign in. Please try again.')
            console.error(err)
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-zinc-400 text-sm">Verifying admin access...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-white/20 flex flex-col items-center justify-center relative overflow-hidden">

            {/* Horizon Glow Effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] h-[50vh] bg-white/[0.05] blur-[100px] rounded-[100%] pointer-events-none" />

            <Link href="/" className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm z-20">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md p-8"
            >
                <div className="text-center mb-12">
                    <div className="w-12 h-12 bg-white rounded-xl mx-auto mb-6 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-black" />
                    </div>
                    <h1 className="text-3xl font-medium tracking-tight mb-2">Admin Access</h1>
                    <p className="text-zinc-500">Sign in with your admin account to continue.</p>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-xs text-zinc-600">
                        Only authorized admin accounts can access this area.
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
                        Not an admin? Sign in as regular user →
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
