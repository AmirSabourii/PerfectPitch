'use client'

import { useEffect, useState } from 'react'

export default function LoadingSpinner() {
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        {/* Simple line animation */}
        <div className="w-32 h-[1px] bg-gray-200 relative overflow-hidden mx-auto mb-8">
          <div 
            className="absolute inset-0 bg-gray-900 animate-slide"
          />
        </div>

        {/* Text */}
        <h3 className="text-sm font-light text-gray-900 tracking-[0.3em] uppercase mb-2">
          ANALYZING{'.'.repeat(dots)}
        </h3>
        <p className="text-xs text-gray-500 font-light">
          Please wait while we process your pitch
        </p>
      </div>
    </div>
  )
}

