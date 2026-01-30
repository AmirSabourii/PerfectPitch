'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { MIN_CREDITS, MAX_CREDITS, CREDIT_PRICE, calculateCreditPackage } from '@/lib/creditSystem'

export function PricingView() {
    const [credits, setCredits] = useState(10)
    const pkg = calculateCreditPackage(credits)
    const sliderPercentage = ((credits - MIN_CREDITS) / (MAX_CREDITS - MIN_CREDITS)) * 100

    return (
        <div className="max-w-2xl mx-auto py-16 px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-medium mb-3 text-white">
                    Pay Per Analysis
                </h2>
                <p className="text-zinc-500">
                    ${CREDIT_PRICE} per analysis. No subscription required.
                </p>
            </div>

            <div className="bg-black border border-white/10 rounded-2xl p-8">
                {/* Slider */}
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

                {/* Price */}
                <div className="flex items-center justify-between py-6 border-t border-white/10">
                    <span className="text-zinc-500">Total</span>
                    <span className="text-4xl font-bold text-white">${pkg.price}</span>
                </div>

                {/* CTA */}
                <Button className="w-full py-4 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-medium text-base mt-6">
                    Get Started
                </Button>
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
