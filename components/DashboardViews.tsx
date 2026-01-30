'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Settings, User, Bell, Shield, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/contexts/DashboardContext'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore'
import PitchAnalysisResult from '@/components/PitchAnalysisResult'
import { Button } from './ui/Button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardCopy } from '@/hooks/useCopy'

export function HistoryView() {
    const { user } = useAuth()
    const { setCurrentView, setPhase, setAnalysisResult, setTranscript, setDocumentContext } = useDashboard()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<any | null>(null)
    const { copy, isRTL } = useDashboardCopy()

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
            <div className="p-8 text-center text-zinc-500" dir={isRTL ? 'rtl' : 'ltr'}>
                {copy.history.signin}
            </div>
        )
    }

    if (loading) {
        return <div className="p-8 text-center text-zinc-500" dir={isRTL ? 'rtl' : 'ltr'}>{copy.history.loading}</div>
    }

    if (selectedSession) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <Button
                    variant="ghost"
                    onClick={() => setSelectedSession(null)}
                    className="text-zinc-500 hover:text-white mb-4 pl-0"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {copy.history.back}
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
        <div className="p-8 max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-2xl font-bold text-white mb-6">{copy.history.heading}</h2>

            {history.length === 0 ? (
                <div className="text-center text-zinc-500 py-12">
                    {copy.history.empty}
                </div>
            ) : (
                history.map((item) => (
                    <Card
                        key={item.id}
                        onClick={() => setSelectedSession(item)}
                        className="p-4 bg-zinc-900 border-zinc-800 flex justify-between items-center hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <div>
                            <h3 className="text-white font-medium">{item.name || copy.history.sessionFallback}</h3>
                            <p className="text-zinc-500 text-sm">{new Date(item.date).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-bold">{copy.history.scoreLabel}: {item.score}</div>
                            {item.duration && <div className="text-zinc-600 text-xs">{item.duration} {copy.history.durationSuffix}</div>}
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
    const [credits, setCredits] = useState({ total: 0, used: 0, remaining: 0 })
    const { copy, isRTL } = useDashboardCopy()

    useEffect(() => {
        async function fetchStats() {
            if (user) {
                try {
                    // Fetch sessions
                    const q = query(collection(db, `users/${user.uid}/sessions`));
                    const querySnapshot = await getDocs(q);
                    const sessions = querySnapshot.docs.map(doc => doc.data());

                    const totalScore = sessions.reduce((acc, curr: any) => acc + (curr.score || 0), 0)
                    const avgScore = sessions.length ? Math.round(totalScore / sessions.length) : 0

                    setStats({
                        sessions: sessions.length,
                        avgScore
                    })

                    // Fetch credits
                    const creditsDoc = await getDoc(doc(db, 'userCredits', user.uid));
                    if (creditsDoc.exists()) {
                        const data = creditsDoc.data();
                        setCredits({
                            total: data.totalCredits || 0,
                            used: data.usedCredits || 0,
                            remaining: data.remainingCredits || 0
                        })
                    }
                } catch (e) {
                    console.error("Error fetching stats", e)
                }
            }
        }
        fetchStats()
    }, [user])

    if (!user) {
        return (
            <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[400px]" dir={isRTL ? 'rtl' : 'ltr'}>
                <Card className="p-8 bg-zinc-900 border-zinc-800 text-center space-y-6 max-w-md w-full">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto flex items-center justify-center">
                        <User className="w-8 h-8 text-zinc-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{copy.profile.signinTitle}</h2>
                        <p className="text-zinc-500">{copy.profile.signinSubtitle}</p>
                    </div>
                    <button
                        onClick={signInWithGoogle}
                        className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <User className="w-5 h-5" />
                        {copy.profile.signinButton}
                    </button>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <Card className="p-8 bg-zinc-900 border-zinc-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button
                        onClick={logout}
                        className="text-zinc-500 hover:text-white transition-colors p-2"
                        title={copy.profile.logout}
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
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{copy.profile.sessionsLabel}</div>
                    </div>
                    <div className="bg-zinc-900 p-6">
                        <div className="text-3xl font-light text-white mb-1">{stats.avgScore}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{copy.profile.avgScoreLabel}</div>
                    </div>
                </div>

                {/* Credits Section */}
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 text-left">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-white font-medium">Credits</h3>
                            <p className="text-zinc-500 text-xs mt-1">Available analysis credits</p>
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-white/5 text-zinc-400 border-white/10">
                            {credits.remaining} Available
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{credits.total}</div>
                            <div className="text-xs text-zinc-500">Total Purchased</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white mb-1">{credits.used}</div>
                            <div className="text-xs text-zinc-500">Used</div>
                        </div>
                    </div>
                </div>

            </Card>
        </div>
    )
}

export function SettingsView() {
    const { copy, isRTL } = useDashboardCopy()
    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-2xl font-bold text-white mb-6">{copy.settings.heading}</h2>

            <Card className="divide-y divide-zinc-800 bg-zinc-900 border-zinc-800">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-zinc-400" />
                        <div>
                            <h3 className="text-white font-medium">{copy.settings.generalTitle}</h3>
                            <p className="text-zinc-500 text-sm">{copy.settings.generalSubtitle}</p>
                        </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-zinc-800 rounded text-white">{copy.settings.edit}</button>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-zinc-400" />
                        <div>
                            <h3 className="text-white font-medium">{copy.settings.notificationsTitle}</h3>
                            <p className="text-zinc-500 text-sm">{copy.settings.notificationsSubtitle}</p>
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
                            <h3 className="text-white font-medium">{copy.settings.privacyTitle}</h3>
                            <p className="text-zinc-500 text-sm">{copy.settings.privacySubtitle}</p>
                        </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-zinc-800 rounded text-white">{copy.settings.manage}</button>
                </div>
            </Card>
        </div>
    )
}
