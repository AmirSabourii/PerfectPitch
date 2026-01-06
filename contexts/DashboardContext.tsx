'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { DeepAnalysisResult, ContextData, View, Phase, InputMethod } from '@/lib/types'
import { RoleType } from '@/components/RoleSelector'

interface DashboardContextType {
    // State
    currentView: View
    phase: Phase
    inputMethod: InputMethod
    isLoading: boolean
    error: string | null
    transcript: string
    analysisResult: DeepAnalysisResult | null
    selectedRole: RoleType
    documentContext: string
    contextData: ContextData

    // Setters
    setCurrentView: (view: View) => void
    setPhase: (phase: Phase) => void
    setInputMethod: (method: InputMethod) => void
    setIsLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    setTranscript: (text: string) => void
    setAnalysisResult: (result: DeepAnalysisResult | null) => void
    setSelectedRole: (role: RoleType) => void
    setDocumentContext: (context: string) => void
    setContextData: (data: ContextData) => void

    // Helpers
    resetDashboard: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [currentView, setCurrentView] = useState<View>('dashboard')
    const [phase, setPhase] = useState<Phase>('selection')
    const [inputMethod, setInputMethod] = useState<InputMethod>('both')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [transcript, setTranscript] = useState<string>('')
    const [analysisResult, setAnalysisResult] = useState<DeepAnalysisResult | null>(null)
    const [selectedRole, setSelectedRole] = useState<RoleType>('vc')
    const [documentContext, setDocumentContext] = useState<string>('')
    const [contextData, setContextData] = useState<ContextData>({ stage: '', industry: '', targetAudience: 'VCs' })

    const resetDashboard = () => {
        setPhase('selection')
        setTranscript('')
        setAnalysisResult(null)
        setDocumentContext('')
        setError(null)
    }

    return (
        <DashboardContext.Provider value={{
            currentView, setCurrentView,
            phase, setPhase,
            inputMethod, setInputMethod,
            isLoading, setIsLoading,
            error, setError,
            transcript, setTranscript,
            analysisResult, setAnalysisResult,
            selectedRole, setSelectedRole,
            documentContext, setDocumentContext,
            contextData, setContextData,
            resetDashboard
        }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}
