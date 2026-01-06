'use client'

import { useDashboard } from '@/contexts/DashboardContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePitchAnalysis } from '@/hooks/usePitchAnalysis'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Mic, Video } from 'lucide-react'

// Components
import AudioRecorder from '@/components/AudioRecorder'
import PitchRecorder from '@/components/PitchRecorder'
import PitchAnalysisResult from '@/components/PitchAnalysisResult'
import RealtimeConversation from '@/components/RealtimeConversation'
import ContextCollection from '@/components/ContextCollection'
import { HistoryView, ProfileView, SettingsView } from '@/components/DashboardViews'
import { PricingView } from '@/components/PricingView'
import { RoleSelector } from '@/components/RoleSelector'

const MinimalLoading = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="relative mb-8">
                <div className="w-16 h-16 border-[1px] border-white/10 rounded-full" />
                <div className="w-16 h-16 border-[1px] border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <h2 className="text-lg font-light text-white tracking-[0.2em] uppercase">Analyzing</h2>
            <div className="flex gap-1 mt-1 h-1">
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-1 h-1 bg-zinc-500 rounded-full"
                />
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-1 h-1 bg-zinc-500 rounded-full"
                />
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-1 h-1 bg-zinc-500 rounded-full"
                />
            </div>
        </div>
    )
}

export function DashboardContent() {
    const {
        currentView, phase, setPhase,
        inputMethod, setInputMethod,
        setContextData, contextData,
        analysisResult, transcript, documentContext,
        selectedRole, setSelectedRole,
        setError, resetDashboard
    } = useDashboard()

    const { user } = useAuth()
    const { handleRecordingComplete } = usePitchAnalysis()

    return (
        <div className="max-w-6xl mx-auto h-full">
            {/* Header Info */}
            {currentView !== 'pricing' && (
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium capitalize text-white">{currentView === 'dashboard' ? 'Practice Session' : currentView.replace('_', ' ')}</h1>
                        <p className="text-zinc-500 text-sm">
                            {currentView === 'dashboard' && "Record and validate your pitch."}
                            {currentView === 'history' && "Review your past performance."}
                        </p>
                    </div>
                    {user && (
                        <div className="hidden md:flex items-center gap-3 bg-white/5 rounded-full pl-2 pr-4 py-1.5 border border-white/5">
                            {user.photoURL ? (
                                <img src={user.photoURL} className="w-6 h-6 rounded-full" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs text-zinc-400">{user.displayName || user.email}</span>
                        </div>
                    )}
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
                                    <h2 className="text-3xl font-medium mb-2 text-white">Choose your input method</h2>
                                    <p className="text-zinc-500 mb-12">How would you like to present your pitch?</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* File Only */}
                                        <button
                                            onClick={() => { setInputMethod('file'); setPhase('context_collection'); }}
                                            className="group p-8 rounded-2xl bg-[#0A0A0A] border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all flex flex-col items-center gap-4 relative overflow-hidden"
                                        >
                                            <div className="p-4 rounded-full bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all group-hover:scale-110">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-medium text-white">File Only</h3>
                                                <p className="text-xs text-zinc-500">Upload a PDF pitch deck for analysis without video.</p>
                                            </div>
                                        </button>

                                        {/* Video Only */}
                                        <button
                                            onClick={() => { setInputMethod('video'); setPhase('context_collection'); }}
                                            className="group p-8 rounded-2xl bg-[#0A0A0A] border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all flex flex-col items-center gap-4"
                                        >
                                            <div className="p-4 rounded-full bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all group-hover:scale-110">
                                                <Mic className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-medium text-white">Speech Only</h3>
                                                <p className="text-xs text-zinc-500">Record your pitch verbally without any slides.</p>
                                            </div>
                                        </button>

                                        {/* Both */}
                                        <button
                                            onClick={() => { setInputMethod('both'); setPhase('context_collection'); }}
                                            className="group p-8 rounded-2xl bg-[#0A0A0A] border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-all flex flex-col items-center gap-4"
                                        >
                                            <div className="p-4 rounded-full bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all group-hover:scale-110">
                                                <Video className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-medium text-white">Full Presentation</h3>
                                                <p className="text-xs text-zinc-500">Record video while presenting your slides.</p>
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
                                            ← Change Mode
                                        </button>
                                        {inputMethod !== 'file' && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live Recording
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-h-0 bg-[#0A0A0A] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col">
                                        {inputMethod !== 'file' && <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />}
                                        <AudioRecorder
                                            mode={inputMethod}
                                            onRecordingComplete={handleRecordingComplete}
                                            onError={setError}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {phase === 'analyzing' && (
                            <motion.div key="analyzing" className="h-[60vh] flex flex-col items-center justify-center w-full">
                                <MinimalLoading />
                            </motion.div>
                        )}

                        {phase === 'results' && analysisResult && (
                            <motion.div key="results" className="w-full h-full">
                                <PitchAnalysisResult
                                    analysis={analysisResult}
                                    transcript={transcript}
                                    documentContext={documentContext}
                                    onStartQnA={() => setPhase('role_selection')}
                                    onReset={resetDashboard}
                                />
                            </motion.div>
                        )}

                        {phase === 'role_selection' && (
                            <motion.div key="role_selection" className="h-full flex flex-col items-center justify-center">
                                <div className="w-full max-w-5xl">
                                    <div className="text-center mb-12">
                                        <h2 className="text-3xl font-medium text-white mb-4">Enter the Boardroom</h2>
                                        <p className="text-zinc-400">Select an AI persona to simulate the meeting.</p>
                                    </div>

                                    <RoleSelector selectedRole={selectedRole} onSelect={(role) => {
                                        setSelectedRole(role)
                                        setPhase('qna')
                                    }} />

                                    <div className="mt-12 text-center">
                                        <button onClick={() => setPhase('results')} className="text-sm text-zinc-500 hover:text-white transition-colors underline underline-offset-4">
                                            ← Return to Analysis Results
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
