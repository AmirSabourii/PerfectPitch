'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { landingCopy, dashboardCopy } from '@/lib/i18n'

export function useLandingCopy() {
  const { language, isRTL } = useLanguage()
  return {
    copy: landingCopy[language],
    language,
    isRTL,
  }
}

export function useDashboardCopy() {
  const { language, isRTL } = useLanguage()
  return {
    copy: dashboardCopy[language],
    language,
    isRTL,
  }
}
