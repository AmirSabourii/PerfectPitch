/**
 * VC Pipeline: types and JSON schema for 4-stage architecture
 * Extraction (Gemini) → Deep Research + Risk-First + Upside-First (parallel) → Adjudicator
 */

// ========== Input: extracted pitch data (from parse-doc / ExtractedDataReview) ==========
export interface ExtractedPitchInput {
  problem: string
  solution: string
  market: string
  competitors: string
  businessModel: string
  traction: string
  team: string
  financials: string
  ask: string
  stage: string
  industry: string
  additionalInfo: string
}

// ========== Dimension score with mandatory reasoning (for both personalities) ==========
export interface DimensionScore {
  score: number // 1-10
  evidence: string[]
  reasoning: string
  whyNotHigher: string
  whyNotLower: string
  confidence: 'high' | 'medium' | 'low'
}

export const DIMENSION_KEYS = [
  'problemUrgency',
  'marketSizeTiming',
  'solutionFit',
  'businessModel',
  'executionTeam',
  'riskAssumptions',
  'tractionEvidence',
] as const

export type DimensionKey = (typeof DIMENSION_KEYS)[number]

export interface DimensionScores {
  problemUrgency: DimensionScore
  marketSizeTiming: DimensionScore
  solutionFit: DimensionScore
  businessModel: DimensionScore
  executionTeam: DimensionScore
  riskAssumptions: DimensionScore
  tractionEvidence: DimensionScore
}

// ========== Personality output (Risk-First and Upside-First share this schema) ==========
export interface PersonalityOutput {
  chainOfReasoning?: string[] // Step-by-step analysis (primary for transparency)
  dimensionScores: DimensionScores
  overallScore: number
  overallReasoning: string
  verdict: 'pass' | 'maybe' | 'proceed'
  verdictReasoning: string
  criticalRisks?: { risk: string; reasoning: string; confidence: string }[]
  upsideDrivers?: { driver: string; reasoning: string; confidence: string }[] // Upside-First only
  biasCheck: string
}

// ========== Deep Research output (matches existing DeepResearchResult minus id/userId) ==========
export interface DeepResearchOutput {
  ideaSummary?: {
    summary: string
    problemStatement: string
    solutionStatement: string
    targetMarket: string
    keyDifferentiator: string
  }
  competitorAnalysis?: Record<string, unknown>
  targetAudienceAnalysis?: Record<string, unknown>
  valuePropositionAnalysis?: Record<string, unknown>
  marketAnalysis?: Record<string, unknown>
  competitiveAdvantage?: Record<string, unknown>
  risksAndChallenges?: Record<string, unknown>
  strategicRecommendations?: Record<string, unknown>
  generatedAt?: string
  language?: 'en' | 'fa'
  [key: string]: unknown
}

// ========== Adjudicator output ==========
export interface PrioritizedChecklistItem {
  priority: number
  item: string
  reasoning?: string
}

export interface AdjudicatorOutput {
  chainOfReasoning?: string[]
  agreement: { point: string; evidence: string }[]
  disagreement: {
    topic: string
    riskFirstView: string
    upsideFirstView: string
    resolution: string
    reasoning: string
  }[]
  useOfResearch: string
  finalScore: number
  finalScoreReasoning: string
  finalVerdict: 'pass' | 'maybe' | 'proceed'
  verdictReasoning: string
  confidence: 'high' | 'medium' | 'low'
  biasCheck: string
  prioritizedChecklist?: {
    ideaImprovements: PrioritizedChecklistItem[]
    pitchImprovements: PrioritizedChecklistItem[]
  }
}

// ========== Full pipeline result (API response) ==========
export interface VCPipelineResult {
  deepResearch: DeepResearchOutput
  riskFirst: PersonalityOutput
  upsideFirst: PersonalityOutput
  adjudicator: AdjudicatorOutput
  metadata?: {
    analyzedAt: string
    extractedStage?: string
    extractedIndustry?: string
  }
}
