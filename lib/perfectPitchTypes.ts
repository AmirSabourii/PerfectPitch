// ============================================
// PerfectPitch Three-Stage Analysis Types
// Based on docs/PERFECTPITCH_PROMPTS.md
// ============================================

// ============================================
// STAGE 1: Core Reasoning & Investor Simulation
// ============================================

export interface DistortionScan {
  buzzwords: string[]
  unsupportedClaims: string[]
  logicalLeaps: string[]
  hiddenOrGlossedOver: string[]
}

export interface IdeaRealityReconstruction {
  actualProblem: string
  realTargetCustomer: string
  coreSolutionMechanism: string
  problemWorthSolving: {
    isVentureScale: boolean
    reasoning: string
  }
}

export interface MarketAndTimingAnalysis {
  marketPull: string
  marketReadiness: string
  competitiveLandscape: string
  timingValidity: {
    whyNow: string
  }
}

export interface ExecutionSignalDetection {
  businessModelClarity: string
  unitEconomics: string
  customerLearningEvidence: string
  tradeOffAwareness: string
  teamMarketProductFit: {
    signals: string
  }
}

export interface InvestorRiskScan {
  fatalAssumptions: string[]
  scalePotential: string
  capitalEfficiency: string
  exitStoryPlausibility: string
  competitiveDefensibility: string
}

export interface PresentationIntegrityCheck {
  narrativeCoherence: string
  missingCriticalEvidence: string[]
  slideBySlideCredibility: string
  ideaQualityVsPitchQualityGap: {
    gap: string
  }
}

export interface ReconstructionReasoning {
  evidenceUsed: string[]
  inferencesMade: string[]
  confidenceLevel: 'high' | 'medium' | 'low'
  contradictionsFound: string[]
}

export interface StartupReconstruction {
  problem: string
  solution: string
  customer: string
  market: string
  businessModel: string
  reconstructionReasoning?: ReconstructionReasoning
}

export interface ScoreBreakdownItem {
  score: number // 1-10
  why: string
  evidence: string[]
}

export interface IdeaQualityReasoning {
  scoreBreakdown: {
    problemSignificance: ScoreBreakdownItem
    solutionNovelty: ScoreBreakdownItem
    marketTiming: ScoreBreakdownItem
    scalePotential: ScoreBreakdownItem
  }
  calculationMethod: string
  whyNotHigher: string
  whyNotLower: string
  comparableIdeas: string[]
}

export interface IdeaQuality {
  score: number // 0-10
  reasoning: IdeaQualityReasoning | string // Support both old and new format
  fundamentalStrength: string
}

export interface PitchQualityReasoning {
  scoreBreakdown: {
    narrativeClarity: ScoreBreakdownItem
    evidenceQuality: ScoreBreakdownItem
    visualEffectiveness: ScoreBreakdownItem
    logicalFlow: ScoreBreakdownItem
  }
  calculationMethod: string
  gapBetweenIdeaAndPresentation: string
  mostEffectiveSlides: string[]
  leastEffectiveSlides: string[]
}

export interface PitchQuality {
  score: number // 0-10
  reasoning: PitchQualityReasoning | string // Support both old and new format
  presentationEffectiveness: string
}

export interface InvestorSignalItem {
  signal: string
  strength?: 'weak' | 'moderate' | 'strong'
  severity?: 'minor' | 'moderate' | 'major'
  fatalityRisk?: 'low' | 'medium' | 'high'
  reasoning: string
  comparablePattern: string
  mitigationPossibility?: string
}

export interface InvestorSignals {
  positive: (string | InvestorSignalItem)[] // Support both formats
  negative: (string | InvestorSignalItem)[]
  critical: (string | InvestorSignalItem)[]
  signalAnalysisMethod?: string
}

export interface PatternMatchItem {
  company: string
  similarity: string
  outcome: string
  relevantLesson: string
  differencesThatMatter: string
}

export interface PatternMatching {
  similarSuccesses: (string | PatternMatchItem)[] // Support both formats
  similarFailures: (string | PatternMatchItem)[]
  uniqueAspects: string[]
  patternConfidence?: string
}

export interface ReadinessReasoning {
  currentStateAssessment: string
  stageRequirements: string
  gapAnalysis: string[]
  scoreJustification: string
  timeToReady: string
}

export interface InvestmentReadiness {
  stage: string
  readiness: number | string // Support both number and string
  readinessReasoning?: ReadinessReasoning
  gapToFundable: string
}

export interface VerdictReasoning {
  decisiveFactors: string[]
  weighingProcess: string
  edgeCaseConsiderations: string
  confidenceDrivers: string
  scenarioAnalysis: {
    bestCase: string
    worstCase: string
    mostLikely: string
  }
}

export interface RawVerdict {
  decision: 'pass' | 'maybe' | 'proceed'
  confidence: 'low' | 'medium' | 'high'
  keyReason: string
  verdictReasoning?: VerdictReasoning
}

export interface OverallReasoningTransparency {
  keyAssumptions: string[]
  uncertaintyAreas: string[]
  dataQuality: string
  biasCheck: string
  alternativeInterpretations: string[]
}

export interface Stage1Output {
  distortionScan: DistortionScan
  ideaRealityReconstruction: IdeaRealityReconstruction
  marketAndTimingAnalysis: MarketAndTimingAnalysis
  executionSignalDetection: ExecutionSignalDetection
  investorRiskScan: InvestorRiskScan
  presentationIntegrityCheck: PresentationIntegrityCheck
  
  // Keep backward compatibility
  startupReconstruction?: StartupReconstruction
  ideaQuality?: IdeaQuality
  pitchQuality?: PitchQuality
  investorSignals?: InvestorSignals
  patternMatching?: PatternMatching
  investmentReadiness?: InvestmentReadiness
  rawVerdict?: RawVerdict
  overallReasoningTransparency?: OverallReasoningTransparency
}

// ============================================
// STAGE 2: Decision Engine & Checklist Generator
// ============================================

export interface DimensionReasoning {
  evidenceFromStage1: string[]
  calculationMethod: string
  scoreJustification: string
  impactOnInvestability: string
}

export interface ScorecardDimension {
  score: number // 1-10
  reasoning: DimensionReasoning | string // Support both formats
}

export interface OverallInvestabilityReasoning {
  aggregationMethod: string
  weightingRationale: string
  nonLinearFactors: string
  finalScoreLogic: string
}

export interface Scorecard {
  problemValidityUrgency: ScorecardDimension
  marketSizeAccessibility: ScorecardDimension
  solutionFitDifferentiation: ScorecardDimension
  businessModelClarity: ScorecardDimension
  competitiveDefensibility: ScorecardDimension
  narrativeCoherence: ScorecardDimension
  evidenceCredibility: ScorecardDimension
  overallInvestability: ScorecardDimension & {
    reasoning: OverallInvestabilityReasoning | string
  }
}

export interface GapItemReasoning {
  whyThisIsWorst?: string
  evidenceOfImpact?: string
  cascadingEffects?: string
  whyThisIsQuickest?: string
  evidenceOfValue?: string
  implementationReality?: string
  evidenceOfIllusion?: string
  consequencesOfIllusion?: string
  difficultyOfCorrection?: string
}

export interface GapDiagnosisItem {
  issue?: string
  action?: string
  illusion?: string
  reality?: string
  currentImpact?: string
  expectedImpact?: string
  reasoning?: GapItemReasoning
}

export interface GapDiagnosis {
  biggestValueGap: string | GapDiagnosisItem
  fastestCredibilityWin: string | GapDiagnosisItem
  dangerousIllusions: (string | GapDiagnosisItem)[]
}

export interface ChecklistItemReasoning {
  whyHighPriority?: string
  whyMediumPriority?: string
  whyLowPriority?: string
  evidenceOfNeed: string[]
  successCriteria: string
  estimatedEffort: string
}

export interface ChecklistItem {
  item: string
  investorConcern: string
  expectedImpact: string
  reasoning: ChecklistItemReasoning
}

export interface PrioritizationMethodology {
  impactCalculation: string
  effortEstimation: string
  tradeOffsConsidered: string
  sequencingLogic: string
}

export interface PrioritizedChecklist {
  high: (string | ChecklistItem)[] // Support both formats
  medium: (string | ChecklistItem)[]
  low: (string | ChecklistItem)[]
  prioritizationMethodology?: PrioritizationMethodology
}

export interface DecisionLogicReasoning {
  scoreThresholds: string
  qualitativeFactors: string
  edgeCaseHandling: string
  decisionTree: string
}

export interface DecisionLogic {
  decision: 'pass' | 'maybe' | 'proceed'
  reasoning: DecisionLogicReasoning | string // Support both formats
  conditions: {
    forPass?: string[]
    forMaybe?: string[]
    forProceed?: string[]
  } | string[] // Support both formats
}

export interface ImprovementRoadmap {
  quickWins: string
  mediumTerm: string
  longTerm: string
}

export interface ImprovementPotentialReasoning {
  currentScoreCalculation: string
  targetScoreLogic: string
  ceilingAssumptions: string
  confidenceDrivers: string
  improvementRoadmap: ImprovementRoadmap
  realismCheck: string
}

export interface ImprovementPotential {
  current: number // X/10
  target: number // Y/10
  ceiling: number // Z/10
  confidence: 'low' | 'medium' | 'high'
  reasoning?: ImprovementPotentialReasoning
}

export interface Stage2Output {
  scorecard: Scorecard
  gapDiagnosis: GapDiagnosis
  prioritizedChecklist: PrioritizedChecklist
  decisionLogic: DecisionLogic
  improvementPotential: ImprovementPotential
}

// ============================================
// STAGE 3: Final Investor Gate & Validation
// ============================================

export interface TestReasoning {
  scoringCriteria?: string
  evidenceChecked?: string[]
  contradictionsFound?: string[]
  alignmentAnalysis?: string
  assumptionInventory?: string[]
  validationStatus?: string
  fatalityAnalysis?: string
  controlAnalysis?: string
  mitigationPossibility?: string
  expectedObjections?: string[]
  addressedObjections?: string[]
  missedObjections?: string[]
  coverageQuality?: string
  impactAssessment?: string
  clarityMetrics?: string
  cognitiveLoad?: string
  messageRetention?: string
  complexityAnalysis?: string
  improvementPotential?: string
  claimInventory?: string[]
  realismCheck?: string
  credibilityAssessment?: string
  skepticismTriggers?: string[]
  comparableData?: string
  narrativeStructure?: string
  logicalFlow?: string
  transitionQuality?: string
  missingSteps?: string[]
  emotionalArc?: string
  scoreCalculation: string
  confidenceLevel: 'high' | 'medium' | 'low'
}

export interface ConsistencyTest {
  score: number // 0-10
  critical_issue: string
  reasoning?: TestReasoning
}

export interface AssumptionStressTest {
  score: number // 0-10
  fatal_dependency: string
  reasoning?: TestReasoning
}

export interface ObjectionCoverageTest {
  score: number // 0-10
  missed_high_impact_item: string
  reasoning?: TestReasoning
}

export interface ClarityUnderPressureTest {
  score: number // 0-10
  '30s_takeaway': string
  reasoning?: TestReasoning
}

export interface MarketBelievabilityTest {
  score: number // 0-10
  unconvincing_claim: string
  reasoning?: TestReasoning
}

export interface StoryCoherenceTest {
  score: number // 0-10
  flow_break_point: string
  reasoning?: TestReasoning
}

export interface FinalInvestorTests {
  consistency_test: ConsistencyTest
  assumption_stress_test: AssumptionStressTest
  objection_coverage_test: ObjectionCoverageTest
  clarity_under_pressure_test: ClarityUnderPressureTest
  market_believability_test: MarketBelievabilityTest
  story_coherence_test: StoryCoherenceTest
}

export interface ScoringMethodology {
  weightingScheme: {
    consistency: string
    assumptionStress: string
    objectionCoverage: string
    clarityUnderPressure: string
    marketBelievability: string
    storyCoherence: string
  }
  aggregationFormula: string
  penaltyApplication: string
  calibrationBenchmarks: string[]
}

export interface BandReasoning {
  thresholdLogic: string
  currentBandJustification: string
  distanceToNextBand: string
  confidenceInBand: string
}

export interface FinalReadinessScore {
  testScores?: {
    consistency: number
    assumptionStress: number
    objectionCoverage: number
    clarityUnderPressure: number
    marketBelievability: number
    storyCoherence: number
  }
  scoringMethodology?: ScoringMethodology
  score_0_to_100?: number
  overall_readiness?: number  // Alternative field name
  overallReadiness?: number   // Another alternative
  readiness_band: 'reject' | 'weak' | 'review' | 'human_review_ready'
  readinessBand?: 'reject' | 'weak' | 'review' | 'human_review_ready' // Alternative
  bandReasoning?: BandReasoning
  critical_issue_penalties?: boolean
}

export interface VerdictDecisionLogic {
  automaticFailTriggers: string[]
  averageScoreAnalysis: string
  exceptionalStrengths: string[]
  fatalWeaknesses: string[]
}

export interface VerdictConfidenceAnalysis {
  certaintyDrivers: string[]
  edgeCaseConsiderations: string
  informationGaps: string[]
  confidenceCalibration: string
}

export interface VerdictAlternativeOutcomes {
  ifPassedWhatRisks: string
  ifRejectedWhatMissed: string
  reversalConditions: string
}

export interface VerdictInvestorTimeValue {
  opportunityCost: string
  expectedValue: string
  timeInvestmentRequired: string
  worthinessCalculation: string
}

export interface VerdictReasoningDetailed {
  decisionLogic: VerdictDecisionLogic
  confidenceAnalysis: VerdictConfidenceAnalysis
  alternativeOutcomes: VerdictAlternativeOutcomes
  investorTimeValue: VerdictInvestorTimeValue
}

export interface InvestorGateVerdict {
  pass_human_review: boolean
  confidence_level: 'low' | 'medium' | 'high'
  main_blocking_reason: string
  verdictReasoning?: VerdictReasoningDetailed
}

export interface Stage3Output {
  // API returns tests at root level (flat structure)
  consistency_test?: ConsistencyTest
  assumption_stress_test?: AssumptionStressTest
  objection_coverage_test?: ObjectionCoverageTest
  clarity_under_pressure_test?: ClarityUnderPressureTest
  market_believability_test?: MarketBelievabilityTest
  story_coherence_test?: StoryCoherenceTest
  
  // OR nested structure (both supported)
  final_investor_tests?: FinalInvestorTests
  
  // Readiness scoring (supports both field names)
  final_readiness_score?: FinalReadinessScore
  final_readiness_scoring?: FinalReadinessScore
  
  investor_gate_verdict: InvestorGateVerdict
}

// ============================================
// Complete PerfectPitch Analysis Result
// ============================================

export interface PerfectPitchAnalysis {
  stage1: Stage1Output
  stage2: Stage2Output
  stage3: Stage3Output
  metadata: {
    analyzedAt: string
    pitchDeckLength: number
    processingTimeMs: number
    userId?: string
    organizationId?: string
    programId?: string
  }
}

// ============================================
// API Input Types
// ============================================

export interface PerfectPitchInput {
  pitchDeckContent: string
  stage?: string // 'pre-seed' | 'seed' | 'series-a'
  industry?: string
  targetInvestorType?: string // 'VC' | 'angel' | 'corporate'
}
