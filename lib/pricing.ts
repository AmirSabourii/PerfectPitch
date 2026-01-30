// Final Pricing Configuration
export type PlanType = 'free' | 'starter' | 'pro' | 'organization'

export interface PlanConfig {
  name: string
  price: number
  pitchAnalysisPerMonth: number
  realtimeSessionsPerMonth: number
  maxRealtimeSessionDuration: number // seconds
  features: string[]
  hasAdminPanel: boolean
  hasDedicatedDatabase: boolean
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'Free',
    price: 0,
    pitchAnalysisPerMonth: 1, // یکبار برای همیشه
    realtimeSessionsPerMonth: 0,
    maxRealtimeSessionDuration: 0,
    features: [
      '1 Pitch Analysis',
      'Basic Dashboard',
      'Sample Results'
    ],
    hasAdminPanel: false,
    hasDedicatedDatabase: false,
  },
  
  starter: {
    name: 'Starter',
    price: 10,
    pitchAnalysisPerMonth: 10,
    realtimeSessionsPerMonth: 6,
    maxRealtimeSessionDuration: 300, // 5 minutes
    features: [
      '10 Pitch Analysis/month',
      '6 AI Conversations (5 min each)',
      'All AI Roles (VC, Mentor, Brainstorm, Practice, Founder Test)',
      'Pitch Recorder',
      'Export to PDF',
      'Unlimited History'
    ],
    hasAdminPanel: false,
    hasDedicatedDatabase: false,
  },
  
  pro: {
    name: 'Pro',
    price: 29,
    pitchAnalysisPerMonth: 40,
    realtimeSessionsPerMonth: 20,
    maxRealtimeSessionDuration: 600, // 10 minutes
    features: [
      '40 Pitch Analysis/month',
      '20 AI Conversations (10 min each)',
      'All Starter Features',
      'Export to PowerPoint',
      'Priority Support',
      'Advanced Analytics'
    ],
    hasAdminPanel: false,
    hasDedicatedDatabase: false,
  },
  
  organization: {
    name: 'Organization',
    price: 20, // per user
    pitchAnalysisPerMonth: 40, // per user
    realtimeSessionsPerMonth: 20, // per user
    maxRealtimeSessionDuration: 600, // 10 minutes
    features: [
      'All Pro Features (per user)',
      'Admin Panel',
      'Team Dashboard',
      'Dedicated Database',
      'Score Filtering',
      'Bulk Actions',
      'API Access'
    ],
    hasAdminPanel: true,
    hasDedicatedDatabase: true,
  },
}

// محاسبه هزینه واقعی
export function calculateActualCost(
  analysisCount: number,
  realtimeCount: number,
  realtimeMinutes: number = 5 // default 5 minutes per session
): number {
  const analysisCost = analysisCount * 0.00165
  const transcriptionCost = analysisCount * 0.75 * 0.024 // 75% با transcription
  
  // Realtime cost based on actual audio token pricing
  // $0.003/min input + $0.015/min output = $0.018/min total
  const realtimeCost = realtimeCount * realtimeMinutes * 0.018
  
  const infrastructure = 0.80
  
  return analysisCost + transcriptionCost + realtimeCost + infrastructure
}

// محاسبه سود
export function calculateProfit(
  plan: PlanType,
  usagePercent: number = 100,
  teamSize: number = 1
): {
  cost: number
  revenue: number
  profit: number
  margin: number
} {
  const config = PLANS[plan]
  const usage = usagePercent / 100
  
  const analysisCount = config.pitchAnalysisPerMonth === -1 
    ? 100 // فرض: کاربر Pro حدود 100 تحلیل در ماه
    : config.pitchAnalysisPerMonth
  
  // Get session duration in minutes
  const sessionMinutes = config.maxRealtimeSessionDuration / 60
  
  const costPerUser = calculateActualCost(
    analysisCount * usage,
    config.realtimeSessionsPerMonth * usage,
    sessionMinutes
  )
  
  const totalCost = costPerUser * teamSize
  const revenue = config.price * teamSize
  const profit = revenue - totalCost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  
  return {
    cost: Math.round(totalCost * 100) / 100,
    revenue,
    profit: Math.round(profit * 100) / 100,
    margin: Math.round(margin * 100) / 100,
  }
}

// Check if user can perform action
export function canPerformAction(
  plan: PlanType,
  action: 'analysis' | 'realtime',
  currentUsage: number
): boolean {
  const config = PLANS[plan]
  
  if (action === 'analysis') {
    // -1 means unlimited
    if (config.pitchAnalysisPerMonth === -1) return true
    return currentUsage < config.pitchAnalysisPerMonth
  }
  
  if (action === 'realtime') {
    return currentUsage < config.realtimeSessionsPerMonth
  }
  
  return false
}

// Get remaining quota
export function getRemainingQuota(
  plan: PlanType,
  action: 'analysis' | 'realtime',
  currentUsage: number
): number {
  const config = PLANS[plan]
  
  if (action === 'analysis') {
    // -1 means unlimited
    if (config.pitchAnalysisPerMonth === -1) return Infinity
    return Math.max(0, config.pitchAnalysisPerMonth - currentUsage)
  }
  
  if (action === 'realtime') {
    return Math.max(0, config.realtimeSessionsPerMonth - currentUsage)
  }
  
  return 0
}

// Get recommended plan based on usage
export function getRecommendedPlan(
  currentPlan: PlanType,
  analysisUsage: number,
  realtimeUsage: number
): PlanType | null {
  const config = PLANS[currentPlan]
  
  // اگر محدودیت رو رد کرده، upgrade پیشنهاد بده
  if (
    analysisUsage >= config.pitchAnalysisPerMonth * 0.8 ||
    realtimeUsage >= config.realtimeSessionsPerMonth * 0.8
  ) {
    if (currentPlan === 'free') return 'starter'
    if (currentPlan === 'starter') return 'pro'
  }
  
  return null
}

// Annual discount
export const ANNUAL_DISCOUNT = 0.16 // 16% off (2 months free)

export function getAnnualPrice(plan: PlanType, teamSize: number = 1): number {
  const monthlyPrice = PLANS[plan].price * teamSize
  const annualPrice = monthlyPrice * 12
  return Math.round(annualPrice * (1 - ANNUAL_DISCOUNT))
}
