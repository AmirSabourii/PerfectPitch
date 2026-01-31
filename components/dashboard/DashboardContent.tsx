'use client'

import React from 'react'
import { useDashboard } from '@/contexts/DashboardContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePitchAnalysis } from '@/hooks/usePitchAnalysis'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Mic, Video } from 'lucide-react'
import { useDashboardCopy } from '@/hooks/useCopy'
import { useCredits } from '@/hooks/useCredits'

// Components
import PitchDeckUpload from '@/components/PitchDeckUpload'
import PitchRecorder from '@/components/PitchRecorder'
import PerfectPitchResult from '@/components/PerfectPitchResult'
import VCPipelineResult from '@/components/VCPipelineResult'
import type { VCPipelineResult as VCPipelineResultType } from '@/lib/vcPipelineTypes'
import RealtimeConversation from '@/components/RealtimeConversation'
import ContextCollection from '@/components/ContextCollection'
import { HistoryView, ProfileView, SettingsView } from '@/components/DashboardViews'
import { PricingView } from '@/components/PricingView'
import { CreditManagement } from '@/components/CreditManagement'
import { CreditIndicator } from '@/components/CreditIndicator'
import { RoleSelector } from '@/components/RoleSelector'
import ExtractedDataReview, { ExtractedPitchData } from '@/components/ExtractedDataReview'

const MinimalLoading = ({ label }: { label: string }) => {
    const [dots, setDots] = React.useState(0)

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev + 1) % 4)
        }, 500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-center gap-6">
                {/* Simple line animation */}
                <div className="w-32 h-[1px] bg-white/20 relative overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-white"
                        animate={{
                            x: ['-100%', '100%']
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />
                </div>

                {/* Text */}
                <div className="text-center">
                    <h3 className="text-sm font-light text-white tracking-[0.3em] uppercase">
                        ANALYZING{'.'.repeat(dots)}
                    </h3>
                </div>
            </div>
        </div>
    )
}

export function DashboardContent() {
    const {
        currentView, setCurrentView, phase, setPhase,
        inputMethod, setInputMethod,
        setContextData, contextData,
        analysisResult, transcript, documentContext,
        selectedRole, setSelectedRole,
        setError, resetDashboard,
        extractedData, setExtractedData
    } = useDashboard()

    const { user, organizationContext } = useAuth()
    const { handleVCPipelineComplete } = usePitchAnalysis()
    const { copy, isRTL } = useDashboardCopy()

    function isVCPipelineResult(r: typeof analysisResult): r is VCPipelineResultType {
        return r != null && typeof r === 'object' && 'deepResearch' in r && 'riskFirst' in r && 'upsideFirst' in r && 'adjudicator' in r
    }
    const { remainingCredits, loading: creditsLoading } = useCredits()

    // Handle file upload completion
    const handleFileProcessed = (parsedContext: string) => {
        try {
            const data: ExtractedPitchData = JSON.parse(parsedContext)
            setExtractedData(data)
            setPhase('data_review')
        } catch (error) {
            console.error('Failed to parse extracted data:', error)
            setError('Failed to process file data')
        }
    }

    // Handle data confirmation: run VC Pipeline (optional Deep Research + 2 personalities + Adjudicator)
    const handleDataConfirm = (
        confirmedData: ExtractedPitchData,
        options?: { useDeepResearch?: boolean }
    ) => {
        setContextData({
            ...contextData,
            stage: confirmedData.stage,
            industry: confirmedData.industry
        })
        handleVCPipelineComplete(
            confirmedData,
            {
                stage: confirmedData.stage,
                industry: confirmedData.industry,
                targetAudience: contextData.targetAudience || 'VCs'
            },
            options?.useDeepResearch ?? false
        )
    }

    const viewMeta: Record<string, { title: string; subtitle: string }> = {
        dashboard: { title: copy.header.practiceTitle, subtitle: copy.header.practiceSubtitle },
        history: { title: copy.history.heading, subtitle: copy.header.historySubtitle },
        profile: { title: copy.profile.signinTitle, subtitle: copy.header.genericSubtitle },
        settings: { title: copy.settings.heading, subtitle: copy.header.genericSubtitle },
        pitch_recorder: { title: copy.sidebar.recorder, subtitle: copy.header.genericSubtitle },
        credits: { title: 'Credits', subtitle: 'Buy credits to analyze your pitch' },
        pricing: { title: 'Pricing', subtitle: 'Simple pay-per-use pricing' },
    }
    const headerContent = viewMeta[currentView] ?? { title: copy.sidebar.brand, subtitle: copy.header.genericSubtitle }

    return (
        <div className="max-w-6xl mx-auto h-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Info */}
            {currentView !== 'pricing' && currentView !== 'credits' && (
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium text-white">{headerContent.title}</h1>
                        <p className="text-zinc-500 text-sm">
                            {headerContent.subtitle}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Credit Balance */}
                        {!creditsLoading && (
                            <button
                                onClick={() => setCurrentView('credits')}
                                className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/10 hover:border-white/20 transition-colors"
                            >
                                <span className="text-xs font-medium text-white">{remainingCredits} Credits</span>
                            </button>
                        )}
                        
                        {/* User Info */}
                        {user && (
                            <div className="hidden md:flex items-center gap-3 bg-white/5 rounded-full pl-2 pr-4 py-1.5 border border-white/5">
                                {user.photoURL ? (
                                    <img src={user.photoURL} className="w-6 h-6 rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="text-xs text-zinc-400">{user.displayName || user.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Views Switcher */}
            {currentView !== 'dashboard' && (
                <AnimatePresence mode="wait">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
                        {currentView === 'history' && <HistoryView />}
                        {currentView === 'profile' && <ProfileView />}
                        {currentView === 'settings' && <SettingsView />}
                        {currentView === 'pricing' && <PricingView />}
                        {currentView === 'credits' && <CreditManagement />}
                        {currentView === 'pitch_recorder' && (
                            <div className="h-full">
                                <PitchRecorder />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Main Practice Flow */}
            {currentView === 'dashboard' && (
                <div className="h-full">
                    <AnimatePresence mode="wait">

                        {phase === 'selection' && (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="h-full flex flex-col items-center justify-center"
                            >
                                <div className="w-full max-w-4xl text-center">
                                    <h2 className="text-3xl font-medium mb-2 text-white">{copy.selection.heading}</h2>
                                    <p className="text-zinc-500 mb-12">{copy.selection.subheading}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md mx-auto">
                                        {/* File Only - Single Option */}
                                        <button
                                            onClick={() => { setInputMethod('file'); setPhase('context_collection'); }}
                                            className="group p-8 rounded-2xl bg-[#0A0A0A] border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all flex flex-col items-center gap-4 relative overflow-hidden"
                                        >
                                            <div className="p-4 rounded-full bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all group-hover:scale-110">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-medium text-white">{copy.selection.fileOnly.title}</h3>
                                                <p className="text-xs text-zinc-500">{copy.selection.fileOnly.description}</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {phase === 'context_collection' && (
                            <motion.div
                                key="context"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col items-center justify-center p-4"
                            >
                                <ContextCollection
                                    onComplete={(data) => {
                                        setContextData(data)
                                        setPhase('recording')
                                    }}
                                    onBack={() => setPhase('selection')}
                                />
                            </motion.div>
                        )}

                        {phase === 'recording' && (
                            <motion.div
                                key="recording"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="h-full flex flex-col items-center justify-center pb-8"
                            >
                                <div className="w-full h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-2 px-4 shrink-0">
                                        <button onClick={() => setPhase('selection')} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                                            {copy.recording.changeMode}
                                        </button>
                                        <CreditIndicator
                                            remainingCredits={remainingCredits}
                                            loading={creditsLoading}
                                            onPurchaseClick={() => setCurrentView('credits')}
                                        />
                                    </div>

                                    <div className="flex-1 min-h-0 bg-[#0A0A0A] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col">
                                        <PitchDeckUpload
                                            onFileProcessed={handleFileProcessed}
                                            onError={setError}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {phase === 'analyzing' && (
                            <motion.div key="analyzing" className="h-[60vh] flex flex-col items-center justify-center w-full">
                                <MinimalLoading label={copy.analyzing.title} />
                            </motion.div>
                        )}

                        {phase === 'data_review' && extractedData && (
                            <motion.div 
                                key="data_review"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full w-full flex flex-col min-h-0 p-4"
                            >
                                <ExtractedDataReview
                                    extractedData={extractedData}
                                    onConfirm={handleDataConfirm}
                                    onCancel={() => {
                                        setExtractedData(null)
                                        setPhase('recording')
                                    }}
                                />
                            </motion.div>
                        )}

                        {phase === 'results' && analysisResult && (
                            <motion.div key="results" className="w-full h-full">
                                {isVCPipelineResult(analysisResult) ? (
                                    <VCPipelineResult
                                        result={analysisResult as VCPipelineResultType}
                                        onReset={resetDashboard}
                                    />
                                ) : (
                                    <PerfectPitchResult
                                        analysis={analysisResult as any}
                                        onReset={resetDashboard}
                                    />
                                )}
                            </motion.div>
                        )}

                        {phase === 'role_selection' && (
                            <motion.div key="role_selection" className="h-full flex flex-col items-center justify-center">
                                <div className="w-full max-w-5xl">
                                    <div className="text-center mb-12">
                                        <h2 className="text-3xl font-medium text-white mb-4">{copy.roleSelection.heading}</h2>
                                        <p className="text-zinc-400">{copy.roleSelection.subheading}</p>
                                    </div>

                                    <RoleSelector selectedRole={selectedRole} onSelect={(role) => {
                                        setSelectedRole(role)
                                        setPhase('qna')
                                    }} />

                                    <div className="mt-12 text-center">
                                        <button onClick={() => setPhase('results')} className="text-sm text-zinc-500 hover:text-white transition-colors underline underline-offset-4">
                                            {copy.roleSelection.returnToResults}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {phase === 'qna' && (
                            <motion.div key="qna" className="h-full">
                                <RealtimeConversation
                                    analysisResult={analysisResult}
                                    contextData={contextData}
                                    onEnd={() => setPhase('results')}
                                    role={selectedRole}
                                />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
