export interface PillarStructure {
    score: number
    breakdown: {
        problem: { present: boolean; score: number; feedback: string }
        solution: { present: boolean; score: number; feedback: string }
        market: { present: boolean; score: number; feedback: string }
        product: { present: boolean; score: number; feedback: string }
        businessModel: { present: boolean; score: number; feedback: string }
        traction: { present: boolean; score: number; feedback: string }
        team: { present: boolean; score: number; feedback: string }
        ask: { present: boolean; score: number; feedback: string }
    }
}

export interface PillarClarity {
    score: number
    metrics: {
        averageSentenceLength: string // e.g. "Short", "Medium", "Long"
        buzzwordDensity: string // e.g. "High", "Low"
        definitionCoverage: string // e.g. "Good", "Poor"
    }
    feedback: string[]
}

export interface PillarLogic {
    flowScore: number
    gaps: string[]
    contradictions: string[]
}

export interface PillarPersuasion {
    score: number
    elements: {
        evidenceBased: number // 0-100
        differentiation: number // 0-100
        urgency: number // 0-100
        socialProof: number // 0-100
    }
}

export interface PillarAudience {
    score: number
    fitAnalysis: string
    investorReadiness: 'Pre-Seed' | 'Seed' | 'Series A' | 'Not Ready'
}

export interface DeepAnalysisResult {
    overallScore: number // 0-100
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
    summary: string
    strengths: string[]
    weaknesses: string[]
    pillars: {
        structure: PillarStructure
        clarity: PillarClarity
        logic: PillarLogic
        persuasion: PillarPersuasion
        audience: PillarAudience
    }
    suggestedRewrite: string
    investorQuestions: string[]
    risks: string[] // New: Skeptic mode risks
    actionItems: string[] // New: Fix-it roadmap
    assets: {
        elevatorPitch: string // New: 30s pitch
        coldEmail: string // New: Investor email
    }
}

export interface ContextData {
    stage: string
    industry: string
    targetAudience: string
}

export type View = 'dashboard' | 'history' | 'profile' | 'settings' | 'pricing' | 'pitch_recorder'
export type Phase = 'selection' | 'context_collection' | 'recording' | 'analyzing' | 'results' | 'role_selection' | 'qna'
export type InputMethod = 'file' | 'video' | 'both'
