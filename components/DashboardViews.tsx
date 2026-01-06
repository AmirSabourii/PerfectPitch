'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Settings, User, Clock, Bell, Shield, Keyboard, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/contexts/DashboardContext'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import PitchAnalysisResult from '@/components/PitchAnalysisResult'
import { Button } from './ui/Button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HistoryView() {
    const { user } = useAuth()
    const { setCurrentView, setPhase, setAnalysisResult, setTranscript, setDocumentContext } = useDashboard()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<any | null>(null)

    useEffect(() => {
        async function fetchHistory() {
            if (!user) {
                setHistory([])
                setLoading(false)
                return
            }

            try {
                const q = query(
                    collection(db, `users/${user.uid}/sessions`),
                    orderBy('date', 'desc')
                )
                const querySnapshot = await getDocs(q)
                const sessions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setHistory(sessions)
            } catch (error) {
                console.error("Error fetching history:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [user])

    const handleStartQnA = () => {
        if (!selectedSession) return
        
        // Set the analysis data in dashboard context
        setAnalysisResult(selectedSession.analysis || { summary: selectedSession.summary, score: selectedSession.score })
        setTranscript(selectedSession.transcript || '')
        setDocumentContext(selectedSession.documentContext || '')
        
        // Navigate to dashboard and start role selection
        setCurrentView('dashboard')
        setPhase('role_selection')
    }

    if (!user) {
        return (
            <div className="p-8 text-center text-zinc-500">
                Please sign in to view your history.
            </div>
        )
    }

    if (loading) {
        return <div className="p-8 text-center text-zinc-500">Loading history...</div>
    }

    if (selectedSession) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => setSelectedSession(null)}
                    className="text-zinc-500 hover:text-white mb-4 pl-0"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to History
                </Button>

                <PitchAnalysisResult
                    analysis={selectedSession.analysis || { summary: selectedSession.summary, score: selectedSession.score }}
                    transcript={selectedSession.transcript || ''}
                    documentContext={selectedSession.documentContext}
                    onStartQnA={handleStartQnA}
                    onReset={() => setSelectedSession(null)}
                />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Session History</h2>

            {history.length === 0 ? (
                <div className="text-center text-zinc-500 py-12">
                    No sessions recorded yet. Start practicing!
                </div>
            ) : (
                history.map((item) => (
                    <Card
                        key={item.id}
                        onClick={() => setSelectedSession(item)}
                        className="p-4 bg-zinc-900 border-zinc-800 flex justify-between items-center hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <div>
                            <h3 className="text-white font-medium">{item.name || 'Pitch Practice'}</h3>
                            <p className="text-zinc-500 text-sm">{new Date(item.date).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-bold">Score: {item.score}</div>
                            {item.duration && <div className="text-zinc-600 text-xs">{item.duration} duration</div>}
                        </div>
                    </Card>
                ))
            )}
        </div>
    )
}

export function ProfileView() {
    const { user, userProfile, signInWithGoogle, logout } = useAuth()
    const [stats, setStats] = useState({ sessions: 0, avgScore: 0 })

    useEffect(() => {
        async function fetchStats() {
            if (user) {
                try {
                    const q = query(collection(db, `users/${user.uid}/sessions`));
                    const querySnapshot = await getDocs(q);
                    const sessions = querySnapshot.docs.map(doc => doc.data());

                    const totalScore = sessions.reduce((acc, curr: any) => acc + (curr.score || 0), 0)
                    const avgScore = sessions.length ? Math.round(totalScore / sessions.length) : 0

                    setStats({
                        sessions: sessions.length,
                        avgScore
                    })
                } catch (e) {
                    console.error("Error fetching stats", e)
                }
            }
        }
        fetchStats()
    }, [user])

    if (!user) {
        return (
            <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
                <Card className="p-8 bg-zinc-900 border-zinc-800 text-center space-y-6 max-w-md w-full">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto flex items-center justify-center">
                        <User className="w-8 h-8 text-zinc-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Sign in to PitchAI</h2>
                        <p className="text-zinc-500">Save your progress and track your improvement over time.</p>
                    </div>
                    <button
                        onClick={signInWithGoogle}
                        className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <User className="w-5 h-5" />
                        Sign in with Google
                    </button>
                </Card>
            </div>
        )
    }

    const PLAN_LIMITS = {
        starter: { analysis: 1, roleplay: 1 },
        pro: { analysis: 20, roleplay: 60 }
    }

    const currentPlan = userProfile?.plan || 'starter'
    const limits = PLAN_LIMITS[currentPlan]
    const usage = userProfile?.usage || { analysisCount: 0, roleplayMinutes: 0 }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <Card className="p-8 bg-zinc-900 border-zinc-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button
                        onClick={logout}
                        className="text-zinc-500 hover:text-white transition-colors p-2"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-zinc-800" />
                ) : (
                    <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-zinc-400">
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-white tracking-tight">{user.displayName || 'User'}</h2>
                <p className="text-zinc-500 mb-8 font-mono text-sm">{user.email}</p>

                <div className="grid grid-cols-2 gap-px bg-zinc-800 rounded-2xl overflow-hidden mb-8 border border-zinc-800">
                    <div className="bg-zinc-900 p-6">
                        <div className="text-3xl font-light text-white mb-1">{stats.sessions}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Sessions</div>
                    </div>
                    <div className="bg-zinc-900 p-6">
                        <div className="text-3xl font-light text-white mb-1">{stats.avgScore}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Avg Score</div>
                    </div>
                </div>

                {/* Plan Usage Section */}
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 text-left">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-white font-medium">Current Plan</h3>
                            <p className="text-zinc-500 text-xs mt-1">Manage your subscription in Settings</p>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                            currentPlan === 'pro'
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                : "bg-white/5 text-zinc-400 border-white/10"
                        )}>
                            {currentPlan}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Analysis Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Analysis Credits</span>
                                <span className="text-white font-mono">{usage.analysisCount} / {limits.analysis}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-500",
                                        usage.analysisCount >= limits.analysis ? "bg-red-500" : "bg-white"
                                    )}
                                    style={{ width: `${Math.min((usage.analysisCount / limits.analysis) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Roleplay Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Roleplay Minutes</span>
                                <span className="text-white font-mono">{usage.roleplayMinutes} / {limits.roleplay}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-500",
                                        usage.roleplayMinutes >= limits.roleplay ? "bg-red-500" : "bg-indigo-500"
                                    )}
                                    style={{ width: `${Math.min((usage.roleplayMinutes / limits.roleplay) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </Card>
        </div>
    )
}

export function SettingsView() {
    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

            <Card className="divide-y divide-zinc-800 bg-zinc-900 border-zinc-800">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-zinc-400" />
                        <div>
                            <h3 className="text-white font-medium">General</h3>
                            <p className="text-zinc-500 text-sm">Language, Timezone</p>
                        </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-zinc-800 rounded text-white">Edit</button>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-zinc-400" />
                        <div>
                            <h3 className="text-white font-medium">Notifications</h3>
                            <p className="text-zinc-500 text-sm">Email, Push</p>
                        </div>
                    </div>
                    <div className="w-10 h-6 bg-emerald-500/20 rounded-full border border-emerald-500/50 relative">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full absolute top-1 right-1" />
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-zinc-400" />
                        <div>
                            <h3 className="text-white font-medium">Privacy</h3>
                            <p className="text-zinc-500 text-sm">Data usage</p>
                        </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-zinc-800 rounded text-white">Manage</button>
                </div>
            </Card>
        </div>
    )
}
