'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MIN_CREDITS, MAX_CREDITS, CREDIT_PRICE, calculateCreditPackage } from '@/lib/creditSystem'

export function PricingSlider() {
  const [credits, setCredits] = useState(10)
  const pkg = calculateCreditPackage(credits)
  const sliderPercentage = ((credits - MIN_CREDITS) / (MAX_CREDITS - MIN_CREDITS)) * 100

  return (
    <div className="bg-black border border-white/10 rounded-2xl p-8 md:p-12">
      {/* Slider */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm text-zinc-500">Credits</span>
          <span className="text-5xl font-bold text-white">{credits}</span>
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
        
        <div className="flex justify-between mt-3 text-xs text-zinc-600">
          <span>{MIN_CREDITS}</span>
          <span>{MAX_CREDITS}</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between py-8 border-t border-b border-white/10 mb-8">
        <div>
          <div className="text-sm text-zinc-500 mb-1">Total Price</div>
          <div className="text-xs text-zinc-600">${CREDIT_PRICE} per analysis</div>
        </div>
        <span className="text-5xl font-bold text-white">${pkg.price}</span>
      </div>

      {/* CTA */}
      <Link 
        href="/login"
        className="block w-full py-4 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-medium text-center text-lg"
      >
        Get Started
      </Link>
      
      <p className="text-xs text-zinc-600 text-center mt-4">
        Sign up to start analyzing. Payment integration coming soon.
      </p>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
