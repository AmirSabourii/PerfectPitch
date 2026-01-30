/**
 * Cost Calculator for AI API Calls
 * محاسبه دقیق هزینه‌های OpenAI API
 */

// قیمت‌های OpenAI (ژانویه 2026)
export const OPENAI_PRICING = {
  'gpt-4o': {
    input: 2.50 / 1_000_000,  // $2.50 per 1M tokens
    output: 10.00 / 1_000_000, // $10.00 per 1M tokens
  },
  'gpt-4o-mini': {
    input: 0.150 / 1_000_000,  // $0.150 per 1M tokens
    output: 0.600 / 1_000_000, // $0.600 per 1M tokens
  },
  'whisper-1': {
    perMinute: 0.006, // $0.006 per minute
  },
} as const

// تخمین تعداد توکن‌ها بر اساس تعداد کلمات
export function estimateTokens(text: string): number {
  // فرمول تقریبی: 1 word ≈ 1.3 tokens (برای انگلیسی)
  const wordCount = text.trim().split(/\s+/).length
  return Math.ceil(wordCount * 1.3)
}

// تخمین تعداد توکن‌ها بر اساس تعداد کاراکترها
export function estimateTokensFromChars(charCount: number): number {
  // فرمول تقریبی: 1 token ≈ 4 characters
  return Math.ceil(charCount / 4)
}

// محاسبه هزینه PerfectPitch Stage 1
export function calculateStage1Cost(pitchTokens: number) {
  const systemPromptTokens = 650
  const userPromptTokens = 150
  const inputTokens = systemPromptTokens + userPromptTokens + pitchTokens
  const outputTokens = 2000 // average

  const inputCost = inputTokens * OPENAI_PRICING['gpt-4o'].input
  const outputCost = outputTokens * OPENAI_PRICING['gpt-4o'].output

  return {
    model: 'gpt-4o',
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  }
}

// محاسبه هزینه PerfectPitch Stage 2
export function calculateStage2Cost(stage1OutputTokens: number = 2000) {
  const systemPromptTokens = 550
  const userPromptTokens = 50
  const inputTokens = systemPromptTokens + userPromptTokens + stage1OutputTokens
  const outputTokens = 1500 // average

  const inputCost = inputTokens * OPENAI_PRICING['gpt-4o-mini'].input
  const outputCost = outputTokens * OPENAI_PRICING['gpt-4o-mini'].output

  return {
    model: 'gpt-4o-mini',
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  }
}

// محاسبه هزینه PerfectPitch Stage 3
export function calculateStage3Cost(
  pitchTokens: number,
  stage1OutputTokens: number = 2000,
  checklistTokens: number = 150
) {
  const systemPromptTokens = 900
  const inputTokens =
    systemPromptTokens + pitchTokens + stage1OutputTokens + checklistTokens
  const outputTokens = 800 // average

  const inputCost = inputTokens * OPENAI_PRICING['gpt-4o'].input
  const outputCost = outputTokens * OPENAI_PRICING['gpt-4o'].output

  return {
    model: 'gpt-4o',
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  }
}

// محاسبه هزینه کامل PerfectPitch
export function calculatePerfectPitchCost(pitchContent: string) {
  const pitchTokens = estimateTokens(pitchContent)

  const stage1 = calculateStage1Cost(pitchTokens)
  const stage2 = calculateStage2Cost(stage1.outputTokens)
  const stage3 = calculateStage3Cost(pitchTokens, stage1.outputTokens)

  return {
    pitchTokens,
    stages: {
      stage1,
      stage2,
      stage3,
    },
    totals: {
      inputTokens: stage1.inputTokens + stage2.inputTokens + stage3.inputTokens,
      outputTokens:
        stage1.outputTokens + stage2.outputTokens + stage3.outputTokens,
      totalCost: stage1.totalCost + stage2.totalCost + stage3.totalCost,
    },
  }
}

// محاسبه هزینه Quick Analysis (Legacy)
export function calculateQuickAnalysisCost(pitchContent: string) {
  const pitchTokens = estimateTokens(pitchContent)
  const systemPromptTokens = 650
  const inputTokens = systemPromptTokens + pitchTokens
  const outputTokens = 1200 // average

  const inputCost = inputTokens * OPENAI_PRICING['gpt-4o-mini'].input
  const outputCost = outputTokens * OPENAI_PRICING['gpt-4o-mini'].output

  return {
    model: 'gpt-4o-mini',
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  }
}

// محاسبه هزینه Deep Research
export function calculateDeepResearchCost(ideaSummary: {
  summary: string
  problemStatement: string
  solutionStatement: string
  targetMarket: string
  keyDifferentiator: string
}) {
  const systemPromptTokens = 400
  const summaryText = Object.values(ideaSummary).join(' ')
  const summaryTokens = estimateTokens(summaryText)
  const inputTokens = systemPromptTokens + summaryTokens
  const outputTokens = 2500 // average

  const inputCost = inputTokens * OPENAI_PRICING['gpt-4o'].input
  const outputCost = outputTokens * OPENAI_PRICING['gpt-4o'].output

  return {
    model: 'gpt-4o',
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  }
}

// محاسبه هزینه Idea Summary Extraction
export function calculateIdeaExtractionCost(pitchContent: string) {
  const pitchTokens = estimateTokens(pitchContent)
  const systemPromptTokens = 200
  const inputTokens = systemPromptTokens + pitchTokens
  const outputTokens = 600 // average

  const inputCost = inputTokens * OPENAI_PRICING['gpt-4o-mini'].input
  const outputCost = outputTokens * OPENAI_PRICING['gpt-4o-mini'].output

  return {
    model: 'gpt-4o-mini',
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  }
}

// محاسبه هزینه Investor Chat (per message)
export function calculateChatCost(
  message: string,
  conversationHistory: string[] = []
) {
  const systemPromptTokens = 100
  const messageTokens = estimateTokens(message)
  const historyTokens = conversationHistory.reduce(
    (sum, msg) => sum + estimateTokens(msg),
    0
  )
  const inputTokens = systemPromptTokens + messageTokens + historyTokens
  const outputTokens = 300 // average

  const inputCost = inputTokens * OPENAI_PRICING['gpt-4o-mini'].input
  const outputCost = outputTokens * OPENAI_PRICING['gpt-4o-mini'].output

  return {
    model: 'gpt-4o-mini',
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  }
}

// محاسبه هزینه Audio Transcription
export function calculateTranscriptionCost(audioMinutes: number) {
  const cost = audioMinutes * OPENAI_PRICING['whisper-1'].perMinute

  return {
    model: 'whisper-1',
    audioMinutes,
    totalCost: cost,
  }
}

// محاسبه هزینه کامل یک سناریو
export interface FullAnalysisScenario {
  pitchContent: string
  audioMinutes?: number
  includeDeepResearch?: boolean
  chatMessages?: number
}

export function calculateFullScenarioCost(scenario: FullAnalysisScenario) {
  const costs: any = {}
  let totalCost = 0

  // Transcription (اگر صوت داشته باشیم)
  if (scenario.audioMinutes) {
    costs.transcription = calculateTranscriptionCost(scenario.audioMinutes)
    totalCost += costs.transcription.totalCost
  }

  // PerfectPitch Analysis
  costs.perfectPitch = calculatePerfectPitchCost(scenario.pitchContent)
  totalCost += costs.perfectPitch.totals.totalCost

  // Idea Extraction
  costs.ideaExtraction = calculateIdeaExtractionCost(scenario.pitchContent)
  totalCost += costs.ideaExtraction.totalCost

  // Deep Research (اگر درخواست شده باشد)
  if (scenario.includeDeepResearch) {
    costs.deepResearch = calculateDeepResearchCost({
      summary: 'Sample summary',
      problemStatement: 'Sample problem',
      solutionStatement: 'Sample solution',
      targetMarket: 'Sample market',
      keyDifferentiator: 'Sample differentiator',
    })
    totalCost += costs.deepResearch.totalCost
  }

  // Chat Messages (اگر داشته باشیم)
  if (scenario.chatMessages && scenario.chatMessages > 0) {
    const chatCost = calculateChatCost('Sample message')
    costs.chat = {
      perMessage: chatCost,
      totalMessages: scenario.chatMessages,
      totalCost: chatCost.totalCost * scenario.chatMessages,
    }
    totalCost += costs.chat.totalCost
  }

  return {
    costs,
    totalCost,
    breakdown: {
      transcription: costs.transcription?.totalCost || 0,
      perfectPitch: costs.perfectPitch.totals.totalCost,
      ideaExtraction: costs.ideaExtraction.totalCost,
      deepResearch: costs.deepResearch?.totalCost || 0,
      chat: costs.chat?.totalCost || 0,
    },
  }
}

// محاسبه هزینه ماهانه بر اساس پلن
export interface PlanUsage {
  analysesPerMonth: number
  averagePitchWords: number
  audioMinutesPerAnalysis?: number
  deepResearchPercentage?: number // 0-100
  chatMessagesPerAnalysis?: number
}

export function calculateMonthlyPlanCost(usage: PlanUsage) {
  const {
    analysesPerMonth,
    averagePitchWords,
    audioMinutesPerAnalysis = 0,
    deepResearchPercentage = 0,
    chatMessagesPerAnalysis = 0,
  } = usage

  // ساخت یک pitch نمونه با تعداد کلمات مشخص
  const samplePitch = 'word '.repeat(averagePitchWords)

  const singleAnalysisCost = calculateFullScenarioCost({
    pitchContent: samplePitch,
    audioMinutes: audioMinutesPerAnalysis,
    includeDeepResearch: deepResearchPercentage > 0,
    chatMessages: chatMessagesPerAnalysis,
  })

  // محاسبه هزینه کل
  const perfectPitchCost =
    singleAnalysisCost.breakdown.perfectPitch * analysesPerMonth
  const transcriptionCost =
    singleAnalysisCost.breakdown.transcription * analysesPerMonth
  const ideaExtractionCost =
    singleAnalysisCost.breakdown.ideaExtraction * analysesPerMonth
  const deepResearchCost =
    singleAnalysisCost.breakdown.deepResearch *
    analysesPerMonth *
    (deepResearchPercentage / 100)
  const chatCost = singleAnalysisCost.breakdown.chat * analysesPerMonth

  const totalMonthlyCost =
    perfectPitchCost +
    transcriptionCost +
    ideaExtractionCost +
    deepResearchCost +
    chatCost

  return {
    analysesPerMonth,
    costPerAnalysis: singleAnalysisCost.totalCost,
    breakdown: {
      perfectPitch: perfectPitchCost,
      transcription: transcriptionCost,
      ideaExtraction: ideaExtractionCost,
      deepResearch: deepResearchCost,
      chat: chatCost,
    },
    totalMonthlyCost,
  }
}

// محاسبه سود بر اساس قیمت پلن
export function calculatePlanProfit(
  planPrice: number,
  usage: PlanUsage
): {
  revenue: number
  cost: number
  profit: number
  margin: number
} {
  const monthlyCost = calculateMonthlyPlanCost(usage)

  return {
    revenue: planPrice,
    cost: monthlyCost.totalMonthlyCost,
    profit: planPrice - monthlyCost.totalMonthlyCost,
    margin:
      ((planPrice - monthlyCost.totalMonthlyCost) / planPrice) * 100,
  }
}

// فرمت کردن هزینه به دلار
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`
}

// فرمت کردن هزینه به سنت
export function formatCostInCents(cost: number): string {
  return `${(cost * 100).toFixed(2)}¢`
}

// مثال استفاده:
/*
const pitchContent = "Your pitch deck content here...";
const cost = calculatePerfectPitchCost(pitchContent);
console.log(`Total cost: ${formatCost(cost.totals.totalCost)}`);
console.log(`Total cost: ${formatCostInCents(cost.totals.totalCost)}`);
*/
