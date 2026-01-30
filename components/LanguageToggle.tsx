'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  className?: string
  variant?: 'pill' | 'ghost'
}

export function LanguageToggle({ className, variant = 'pill' }: LanguageToggleProps) {
  const { language, toggleLanguage, isRTL } = useLanguage()

  const labelMap = {
    en: {
      iconLabel: 'Switch language',
      persian: 'فارسی',
      english: 'EN',
    },
    fa: {
      iconLabel: 'تغییر زبان',
      persian: 'فارسی',
      english: 'EN',
    },
  } as const

  const labels = language === 'fa' ? labelMap.fa : labelMap.en

  if (variant === 'ghost') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          'inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors',
          className
        )}
        aria-label={labels.iconLabel}
      >
        <Languages className="w-4 h-4" />
        <span>{language === 'fa' ? labels.english : labels.persian}</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleLanguage}
      aria-label={labels.iconLabel}
      className={cn(
        'flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5',
        className
      )}
    >
      <Languages className="w-4 h-4 opacity-70" />
      <div className="flex items-center gap-1 text-[11px] uppercase">
        <span className={cn(language === 'en' && 'text-white')}>{labels.english}</span>
        <span className="opacity-40">/</span>
        <span className={cn(isRTL && 'text-white')}>{labels.persian}</span>
      </div>
    </button>
  )
}
