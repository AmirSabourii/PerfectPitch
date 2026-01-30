'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CreditIndicatorProps {
  remainingCredits: number
  loading?: boolean
  onPurchaseClick?: () => void
}

export function CreditIndicator({
  remainingCredits,
  loading = false,
  onPurchaseClick,
}: CreditIndicatorProps) {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-xs text-zinc-400">Loading...</span>
      </div>
    )
  }

  const isEmpty = remainingCredits === 0

  return (
    <motion.button
      onClick={onPurchaseClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-xs font-medium text-white">
        {remainingCredits} {isEmpty ? 'Credits - Buy Now' : 'Credits'}
      </span>
    </motion.button>
  )
}
