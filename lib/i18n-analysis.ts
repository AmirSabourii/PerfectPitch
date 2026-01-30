// Translations for PerfectPitch Analysis Results Component
export type SupportedLanguage = 'en' | 'fa'

interface AnalysisResultCopy {
  // Tabs
  tabs: {
    overview: string
    stage1: string
    stage2: string
    stage3: string
    rawData: string
  }
  
  // Overview
  overview: {
    readinessScore: string
    investorGateVerdict: string
    pass: string
    needsWork: string
    confidence: string
    ideaQuality: string
    pitchQuality: string
    positiveSignals: string
    concerns: string
    criticalIssues: string
    noPositive: string
    noConcerns: string
    noCritical: string
  }
  
  // Stage 1
  stage1: {
    title: string
    startupReconstruction: string
    problem: string
    solution: string
    customer: string
    market: string
    businessModel: string
    ideaQuality: string
    pitchQuality: string
    reasoning: string
    fundamentalStrength: string
    presentationEffectiveness: string
    patternMatching: string
    similarSuccesses: string
    similarFailures: string
    uniqueAspects: string
    noneIdentified: string
    investmentReadiness: string
    stage: string
    readiness: string
    gapToFundable: string
    rawVerdict: string
    decision: string
    confidence: string
    keyReason: string
  }
  
  // Stage 2
  stage2: {
    title: string
    investmentScorecard: string
    gapDiagnosis: string
    biggestGap: string
    fastestWin: string
    dangerousIllusions: string
    prioritizedChecklist: string
    highPriority: string
    mediumPriority: string
    lowPriority: string
    mustFix: string
    shouldFix: string
    niceToHave: string
    none: string
    decisionLogic: string
    decision: string
    reasoning: string
    conditions: string
    improvementPotential: string
    currentScore: string
    realisticTarget: string
    bestCaseCeiling: string
    confidence: string
  }
  
  // Stage 3
  stage3: {
    title: string
    sixCriticalTests: string
    consistencyTest: string
    assumptionStressTest: string
    objectionCoverageTest: string
    clarityUnderPressureTest: string
    marketBelievabilityTest: string
    storyCoherenceTest: string
    criticalIssue: string
    fatalDependency: string
    missedHighImpactItem: string
    thirtySecondTakeaway: string
    unconvincingClaim: string
    flowBreakPoint: string
    finalReadinessScoring: string
    band: string
    criticalIssuePenalties: string
    investorGateVerdict: string
    passHumanReview: string
    confidenceLevel: string
    mainBlockingReason: string
  }
  
  // Raw Data
  rawData: {
    title: string
    completeAnalysisData: string
    copyJson: string
    copied: string
    analysisMetadata: string
    analyzedAt: string
    pitchDeckLength: string
    characters: string
    processingTime: string
    seconds: string
  }
  
  // Common
  common: {
    na: string
    resetAnalysis: string
    tryAgain: string
    analysisDataMissing: string
    analysisIncomplete: string
    dataIncomplete: string
    checkRawData: string
    viewRawData: string
  }
  
  // Readiness Bands
  readinessBands: {
    human_review_ready: string
    review: string
    weak: string
    reject: string
  }
}

export const analysisResultCopy: Record<SupportedLanguage, AnalysisResultCopy> = {
  en: {
    tabs: {
      overview: 'Overview',
      stage1: 'Stage 1: Investor Sim',
      stage2: 'Stage 2: Decision',
      stage3: 'Stage 3: Validation',
      rawData: 'Raw Data',
    },
    overview: {
      readinessScore: 'Readiness Score',
      investorGateVerdict: 'Investor Gate Verdict',
      pass: 'PASS',
      needsWork: 'NEEDS WORK',
      confidence: 'Confidence',
      ideaQuality: 'Idea Quality',
      pitchQuality: 'Pitch Quality',
      positiveSignals: 'Positive Signals',
      concerns: 'Concerns',
      criticalIssues: 'Critical Issues',
      noPositive: 'No positive signals identified',
      noConcerns: 'No concerns identified',
      noCritical: 'No critical issues identified',
    },
    stage1: {
      title: 'Stage 1: Investor Simulation',
      startupReconstruction: 'Startup Reconstruction',
      problem: 'Problem',
      solution: 'Solution',
      customer: 'Customer',
      market: 'Market',
      businessModel: 'Business Model',
      ideaQuality: 'Idea Quality',
      pitchQuality: 'Pitch Quality',
      reasoning: 'Reasoning',
      fundamentalStrength: 'Fundamental Strength',
      presentationEffectiveness: 'Presentation Effectiveness',
      patternMatching: 'Pattern Matching',
      similarSuccesses: 'Similar Successes',
      similarFailures: 'Similar Failures',
      uniqueAspects: 'Unique Aspects',
      noneIdentified: 'None identified',
      investmentReadiness: 'Investment Readiness',
      stage: 'Stage',
      readiness: 'Readiness',
      gapToFundable: 'Gap to Fundable',
      rawVerdict: 'Raw Verdict',
      decision: 'Decision',
      confidence: 'Confidence',
      keyReason: 'Key Reason',
    },
    stage2: {
      title: 'Stage 2: Decision Engine',
      investmentScorecard: 'Investment Scorecard',
      gapDiagnosis: 'Gap Diagnosis',
      biggestGap: 'Biggest Gap',
      fastestWin: 'Fastest Win',
      dangerousIllusions: 'Dangerous Illusions',
      prioritizedChecklist: 'Prioritized Action Checklist',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      mustFix: 'Must Fix',
      shouldFix: 'Should Fix',
      niceToHave: 'Nice to Have',
      none: 'None',
      decisionLogic: 'Decision Logic',
      decision: 'Decision',
      reasoning: 'Reasoning',
      conditions: 'Conditions',
      improvementPotential: 'Improvement Potential',
      currentScore: 'Current Score',
      realisticTarget: 'Realistic Target',
      bestCaseCeiling: 'Best Case Ceiling',
      confidence: 'Confidence',
    },
    stage3: {
      title: 'Stage 3: Final Validation',
      sixCriticalTests: 'Six Critical Investor Tests',
      consistencyTest: 'Consistency Test',
      assumptionStressTest: 'Assumption Stress Test',
      objectionCoverageTest: 'Objection Coverage Test',
      clarityUnderPressureTest: 'Clarity Under Pressure',
      marketBelievabilityTest: 'Market Believability',
      storyCoherenceTest: 'Story Coherence',
      criticalIssue: 'Critical Issue',
      fatalDependency: 'Fatal Dependency',
      missedHighImpactItem: 'Missed High Impact Item',
      thirtySecondTakeaway: '30-Second Takeaway',
      unconvincingClaim: 'Unconvincing Claim',
      flowBreakPoint: 'Flow Break Point',
      finalReadinessScoring: 'Final Readiness Scoring',
      band: 'Band',
      criticalIssuePenalties: 'Critical Issue Penalties Applied',
      investorGateVerdict: 'Investor Gate Verdict',
      passHumanReview: 'Pass Human Review',
      confidenceLevel: 'Confidence Level',
      mainBlockingReason: 'Main Blocking Reason',
    },
    rawData: {
      title: 'Raw Data',
      completeAnalysisData: 'Complete Analysis Data (JSON)',
      copyJson: 'Copy JSON',
      copied: 'Copied to clipboard!',
      analysisMetadata: 'Analysis Metadata',
      analyzedAt: 'Analyzed At',
      pitchDeckLength: 'Pitch Deck Length',
      characters: 'characters',
      processingTime: 'Processing Time',
      seconds: 's',
    },
    common: {
      na: 'N/A',
      resetAnalysis: 'Reset Analysis',
      tryAgain: 'Try Again',
      analysisDataMissing: 'Analysis Data Missing',
      analysisIncomplete: 'The analysis data is incomplete or corrupted.',
      dataIncomplete: 'Data Incomplete',
      checkRawData: 'Some analysis data is missing. Please check the Raw Data tab to see what was returned.',
      viewRawData: 'View Raw Data',
    },
    readinessBands: {
      human_review_ready: 'HUMAN REVIEW READY',
      review: 'REVIEW',
      weak: 'WEAK',
      reject: 'REJECT',
    },
  },
  fa: {
    tabs: {
      overview: 'خلاصه',
      stage1: 'مرحله ۱: شبیه‌سازی سرمایه‌گذار',
      stage2: 'مرحله ۲: تصمیم‌گیری',
      stage3: 'مرحله ۳: اعتبارسنجی',
      rawData: 'داده خام',
    },
    overview: {
      readinessScore: 'امتیاز آمادگی',
      investorGateVerdict: 'حکم نهایی سرمایه‌گذار',
      pass: 'قبول',
      needsWork: 'نیاز به بهبود',
      confidence: 'اطمینان',
      ideaQuality: 'کیفیت ایده',
      pitchQuality: 'کیفیت پیچ',
      positiveSignals: 'سیگنال‌های مثبت',
      concerns: 'نگرانی‌ها',
      criticalIssues: 'مسائل حیاتی',
      noPositive: 'سیگنال مثبتی شناسایی نشد',
      noConcerns: 'نگرانی‌ای شناسایی نشد',
      noCritical: 'مسئله حیاتی شناسایی نشد',
    },
    stage1: {
      title: 'مرحله ۱: شبیه‌سازی سرمایه‌گذار',
      startupReconstruction: 'بازسازی استارتاپ',
      problem: 'مشکل',
      solution: 'راه‌حل',
      customer: 'مشتری',
      market: 'بازار',
      businessModel: 'مدل کسب‌وکار',
      ideaQuality: 'کیفیت ایده',
      pitchQuality: 'کیفیت پیچ',
      reasoning: 'استدلال',
      fundamentalStrength: 'قدرت بنیادی',
      presentationEffectiveness: 'اثربخشی ارائه',
      patternMatching: 'تطبیق الگو',
      similarSuccesses: 'موفقیت‌های مشابه',
      similarFailures: 'شکست‌های مشابه',
      uniqueAspects: 'جنبه‌های منحصربه‌فرد',
      noneIdentified: 'موردی شناسایی نشد',
      investmentReadiness: 'آمادگی سرمایه‌گذاری',
      stage: 'مرحله',
      readiness: 'آمادگی',
      gapToFundable: 'فاصله تا قابل سرمایه‌گذاری',
      rawVerdict: 'حکم اولیه',
      decision: 'تصمیم',
      confidence: 'اطمینان',
      keyReason: 'دلیل اصلی',
    },
    stage2: {
      title: 'مرحله ۲: موتور تصمیم‌گیری',
      investmentScorecard: 'کارت امتیازی سرمایه‌گذاری',
      gapDiagnosis: 'تشخیص شکاف',
      biggestGap: 'بزرگ‌ترین شکاف',
      fastestWin: 'سریع‌ترین برد',
      dangerousIllusions: 'توهمات خطرناک',
      prioritizedChecklist: 'چک‌لیست اولویت‌بندی شده',
      highPriority: 'اولویت بالا',
      mediumPriority: 'اولویت متوسط',
      lowPriority: 'اولویت پایین',
      mustFix: 'باید اصلاح شود',
      shouldFix: 'بهتر است اصلاح شود',
      niceToHave: 'خوب است داشته باشد',
      none: 'هیچ',
      decisionLogic: 'منطق تصمیم',
      decision: 'تصمیم',
      reasoning: 'استدلال',
      conditions: 'شرایط',
      improvementPotential: 'پتانسیل بهبود',
      currentScore: 'امتیاز فعلی',
      realisticTarget: 'هدف واقع‌بینانه',
      bestCaseCeiling: 'سقف بهترین حالت',
      confidence: 'اطمینان',
    },
    stage3: {
      title: 'مرحله ۳: اعتبارسنجی نهایی',
      sixCriticalTests: 'شش تست حیاتی سرمایه‌گذار',
      consistencyTest: 'تست سازگاری',
      assumptionStressTest: 'تست استرس فرضیات',
      objectionCoverageTest: 'تست پوشش اعتراضات',
      clarityUnderPressureTest: 'وضوح تحت فشار',
      marketBelievabilityTest: 'باورپذیری بازار',
      storyCoherenceTest: 'انسجام داستان',
      criticalIssue: 'مسئله حیاتی',
      fatalDependency: 'وابستگی کشنده',
      missedHighImpactItem: 'مورد پرتأثیر از قلم افتاده',
      thirtySecondTakeaway: 'برداشت ۳۰ ثانیه‌ای',
      unconvincingClaim: 'ادعای غیرقانع‌کننده',
      flowBreakPoint: 'نقطه شکست جریان',
      finalReadinessScoring: 'امتیازدهی نهایی آمادگی',
      band: 'رده',
      criticalIssuePenalties: 'جریمه مسائل حیاتی اعمال شد',
      investorGateVerdict: 'حکم دروازه سرمایه‌گذار',
      passHumanReview: 'عبور از بررسی انسانی',
      confidenceLevel: 'سطح اطمینان',
      mainBlockingReason: 'دلیل اصلی مسدودسازی',
    },
    rawData: {
      title: 'داده خام',
      completeAnalysisData: 'داده کامل تحلیل (JSON)',
      copyJson: 'کپی JSON',
      copied: 'در کلیپ‌بورد کپی شد!',
      analysisMetadata: 'متادیتای تحلیل',
      analyzedAt: 'تحلیل شده در',
      pitchDeckLength: 'طول دک پیچ',
      characters: 'کاراکتر',
      processingTime: 'زمان پردازش',
      seconds: 'ثانیه',
    },
    common: {
      na: 'ندارد',
      resetAnalysis: 'بازنشانی تحلیل',
      tryAgain: 'تلاش مجدد',
      analysisDataMissing: 'داده تحلیل موجود نیست',
      analysisIncomplete: 'داده تحلیل ناقص یا خراب است.',
      dataIncomplete: 'داده ناقص',
      checkRawData: 'برخی داده‌های تحلیل موجود نیست. لطفاً تب داده خام را بررسی کنید.',
      viewRawData: 'مشاهده داده خام',
    },
    readinessBands: {
      human_review_ready: 'آماده بررسی انسانی',
      review: 'بررسی',
      weak: 'ضعیف',
      reject: 'رد',
    },
  },
}
