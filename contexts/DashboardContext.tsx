'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { DeepAnalysisResult, ContextData, View, Phase, InputMethod } from '@/lib/types'
import { PerfectPitchAnalysis } from '@/lib/perfectPitchTypes'
import { VCPipelineResult } from '@/lib/vcPipelineTypes'
import { RoleType } from '@/components/RoleSelector'
import { ExtractedPitchData } from '@/components/ExtractedDataReview'

interface DashboardContextType {
    // State
    currentView: View
    phase: Phase
    inputMethod: InputMethod
    isLoading: boolean
    error: string | null
    transcript: string
    analysisResult: DeepAnalysisResult | PerfectPitchAnalysis | VCPipelineResult | null
    selectedRole: RoleType
    documentContext: string
    contextData: ContextData
    extractedData: ExtractedPitchData | null

    // Setters
    setCurrentView: (view: View) => void
    setPhase: (phase: Phase) => void
    setInputMethod: (method: InputMethod) => void
    setIsLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    setTranscript: (text: string) => void
    setAnalysisResult: (result: DeepAnalysisResult | PerfectPitchAnalysis | VCPipelineResult | null) => void
    setSelectedRole: (role: RoleType) => void
    setDocumentContext: (context: string) => void
    setContextData: (data: ContextData) => void
    setExtractedData: (data: ExtractedPitchData | null) => void

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
    const [analysisResult, setAnalysisResult] = useState<DeepAnalysisResult | PerfectPitchAnalysis | null>(null)
    const [selectedRole, setSelectedRole] = useState<RoleType>('vc')
    const [documentContext, setDocumentContext] = useState<string>('')
    const [contextData, setContextData] = useState<ContextData>({ stage: '', industry: '', targetAudience: 'VCs' })
    const [extractedData, setExtractedData] = useState<ExtractedPitchData | null>(null)

    const resetDashboard = () => {
        setPhase('selection')
        setTranscript('')
        setAnalysisResult(null)
        setDocumentContext('')
        setError(null)
        setExtractedData(null)
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
            extractedData, setExtractedData,
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
