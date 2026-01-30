'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { UserCredits, formatCredits } from '@/lib/creditSystem'
import { creditService } from '@/lib/services/creditService'
import { useAuth } from '@/contexts/AuthContext'
import { MIN_CREDITS, MAX_CREDITS, CREDIT_PRICE, calculateCreditPackage } from '@/lib/creditSystem'

export function CreditManagement() {
  const { user } = useAuth()
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [credits, setCredits] = useState(10)

  const pkg = calculateCreditPackage(credits)
  const sliderPercentage = ((credits - MIN_CREDITS) / (MAX_CREDITS - MIN_CREDITS)) * 100

  useEffect(() => {
    if (user) {
      loadUserCredits()
    }
  }, [user])

  const loadUserCredits = async () => {
    if (!user) return
    try {
      setLoading(true)
      const credits = await creditService.getUserCredits(user.uid)
      setUserCredits(credits)
    } catch (error) {
      console.error('Failed to load credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!user) return
    try {
      setPurchasing(true)
      
      // TODO: Payment gateway integration required
      // This is a placeholder - DO NOT use in production without payment gateway
      alert('Payment gateway coming soon! This is a demo version.')
      
      // IMPORTANT: Remove this test code before production
      // await creditService.purchaseCredits(
      //   user.uid,
      //   credits,
      //   pkg.price,
      //   'test_payment',
      //   `txn_${Date.now()}`
      // )
      // await loadUserCredits()
      
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const remaining = userCredits?.remainingCredits || 0

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Balance */}
      <div className="bg-black border border-white/10 rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500 mb-1">Available Credits</div>
            <div className="text-4xl font-bold text-white">{remaining}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500 mb-1">Total Purchased</div>
            <div className="text-2xl font-semibold text-white">{userCredits?.totalCredits || 0}</div>
          </div>
        </div>
      </div>

      {/* Purchase */}
      <div className="bg-black border border-white/10 rounded-2xl p-8">
        <h3 className="text-lg font-medium text-white mb-6">Buy Credits</h3>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-zinc-500">Credits</span>
            <span className="text-3xl font-bold text-white">{credits}</span>
          </div>
          
          <input
            type="range"
            min={MIN_CREDITS}
            max={MAX_CREDITS}
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, white 0%, white ${sliderPercentage}%, rgb(255 255 255 / 0.1) ${sliderPercentage}%, rgb(255 255 255 / 0.1) 100%)`,
            }}
          />
          
          <div className="flex justify-between mt-2 text-xs text-zinc-600">
            <span>{MIN_CREDITS}</span>
            <span>{MAX_CREDITS}</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-6 border-t border-white/10 mb-6">
          <span className="text-zinc-500">Total</span>
          <span className="text-4xl font-bold text-white">${pkg.price}</span>
        </div>

        <Button 
          onClick={handlePurchase}
          disabled={purchasing}
          className="w-full py-4 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-medium"
        >
          {purchasing ? 'Processing...' : 'Coming Soon - Payment Gateway'}
        </Button>
        
        <p className="text-xs text-zinc-500 text-center mt-4">
          Payment integration will be available soon. This is a demo version.
        </p>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
