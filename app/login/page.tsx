'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
    const { signInWithGoogle, user } = useAuth()
    const router = useRouter()
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (user) {
            router.push('/dashboard')
        }
    }, [user, router])

    const handleLogin = async () => {
        try {
            setError(null)
            await signInWithGoogle()
        } catch (err: any) {
            setError('Failed to sign in. Please try again.')
            console.error(err)
        }
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
                        <div className="w-6 h-6 bg-black rounded-sm" />
                    </div>
                    <h1 className="text-3xl font-medium tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-zinc-500">Sign in to continue to your dashboard.</p>
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
                        By clicking continue, you agree to our <span className="text-zinc-400">Terms of Service</span> and <span className="text-zinc-400">Privacy Policy</span>.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
