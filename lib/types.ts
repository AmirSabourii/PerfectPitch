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

export type View = 'dashboard' | 'history' | 'profile' | 'settings' | 'pricing' | 'pitch_recorder' | 'credits'
export type Phase = 'selection' | 'context_collection' | 'recording' | 'analyzing' | 'results' | 'role_selection' | 'qna' | 'data_review'
export type InputMethod = 'file' | 'video' | 'both'

// ============================================
// Deep Research Analysis Types
// ============================================

export interface IdeaSummary {
    summary: string // 3-5 line summary
    problemStatement: string
    solutionStatement: string
    targetMarket: string
    keyDifferentiator: string
}

export interface Competitor {
    name: string
    description: string
    strengths: string[]
    weaknesses: string[]
    pricing?: string
    marketShare?: string
    differentiators: string[]
}

export interface CompetitiveMatrix {
    features: string[]
    comparison: Record<string, Record<string, boolean | string>>
}

export interface CompetitorAnalysis {
    directCompetitors: Competitor[]
    indirectCompetitors: Competitor[]
    competitiveMatrix: CompetitiveMatrix
    marketPositioning: string
}

export interface UserPersona {
    name: string
    description: string
    demographics: string
    painPoints: string[]
    needs: string[]
    reasonsToUse: string[]
    willingnessToPay: string
}

export interface MarketSize {
    tam: string // Total Addressable Market
    sam: string // Serviceable Addressable Market
    som: string // Serviceable Obtainable Market
    methodology: string
}

export interface TargetAudienceAnalysis {
    personas: UserPersona[]
    marketSize: MarketSize
    adoptionBarriers: string[]
    adoptionDrivers: string[]
}

export interface ProblemSolved {
    problem: string
    solution: string
    priority: 'high' | 'medium' | 'low'
    userImpact: string
}

export interface ValuePropositionAnalysis {
    coreValue: string
    problemsSolved: ProblemSolved[]
    valueHierarchy: string[]
    recommendedMessaging: string[]
}

export interface MarketTrend {
    trend: string
    impact: 'positive' | 'negative' | 'neutral'
    timeframe: string
    relevance: string
}

export interface Opportunity {
    opportunity: string
    potential: 'high' | 'medium' | 'low'
    timeToCapture: string
    requiredResources: string[]
}

export interface Threat {
    threat: string
    severity: 'high' | 'medium' | 'low'
    likelihood: 'high' | 'medium' | 'low'
    mitigation: string
}

export interface MarketAnalysis {
    marketSize: MarketSize
    trends: MarketTrend[]
    opportunities: Opportunity[]
    threats: Threat[]
    growthProjection: string
}

export interface Advantage {
    advantage: string
    type: 'technology' | 'market' | 'team' | 'timing' | 'other'
    strength: 'strong' | 'moderate' | 'weak'
    explanation: string
}

export interface CompetitiveAdvantage {
    advantages: Advantage[]
    moat: string
    sustainability: string
    defensibility: string
}

export interface Risk {
    risk: string
    category: 'market' | 'technical' | 'financial' | 'regulatory' | 'competitive'
    probability: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    mitigation: string
}

export interface Challenge {
    challenge: string
    difficulty: 'high' | 'medium' | 'low'
    timeframe: string
    approach: string
}

export interface RisksAndChallenges {
    risks: Risk[]
    challenges: Challenge[]
    mitigationStrategies: string[]
}

export interface Recommendation {
    title: string
    description: string
    rationale: string
    expectedImpact: string
    effort: 'low' | 'medium' | 'high'
    timeframe: string
    priority: number
}

export interface StrategicRecommendations {
    quickWins: Recommendation[]
    longTermInitiatives: Recommendation[]
    priorityOrder: string[]
    keyMetrics: string[]
}

export interface DeepResearchResult {
    id: string
    userId: string
    ideaSummary: IdeaSummary
    competitorAnalysis: CompetitorAnalysis
    targetAudienceAnalysis: TargetAudienceAnalysis
    valuePropositionAnalysis: ValuePropositionAnalysis
    marketAnalysis: MarketAnalysis
    competitiveAdvantage: CompetitiveAdvantage
    risksAndChallenges: RisksAndChallenges
    strategicRecommendations: StrategicRecommendations
    generatedAt: string
    language: 'en' | 'fa'
}
