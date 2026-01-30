'use client'

/**
 * SafeJsonDisplay - کامپوننت امن برای نمایش هر نوع JSON object
 * 
 * این کامپوننت تضمین می‌کند که:
 * 1. هیچ خطایی در render رخ ندهد
 * 2. همه انواع داده (string, number, boolean, array, object, null) به درستی نمایش داده شوند
 * 3. ساختارهای تو در تو (nested) به خوبی handle شوند
 * 4. UI زیبا و قابل خواندن باشد
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SafeJsonDisplayProps {
  data: any
  label?: string
  level?: number
  defaultExpanded?: boolean
}

export function SafeJsonDisplay({ 
  data, 
  label, 
  level = 0,
  defaultExpanded = false 
}: SafeJsonDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || level < 2)

  // Handle null/undefined
  if (data === null || data === undefined) {
    return (
      <div className={cn("py-1", level > 0 && "pl-4")}>
        {label && <span className="text-zinc-500 text-xs font-medium">{label}: </span>}
        <span className="text-zinc-600 italic text-xs">N/A</span>
      </div>
    )
  }

  // Handle primitives (string, number, boolean)
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return (
      <div className={cn("py-1", level > 0 && "pl-4")}>
        {label && <span className="text-zinc-500 text-xs font-medium">{label}: </span>}
        <span className={cn(
          "text-xs",
          typeof data === 'string' && "text-zinc-300",
          typeof data === 'number' && "text-blue-400 font-mono",
          typeof data === 'boolean' && (data ? "text-emerald-400" : "text-red-400")
        )}>
          {typeof data === 'boolean' ? (data ? '✓ Yes' : '✗ No') : String(data)}
        </span>
      </div>
    )
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className={cn("py-1", level > 0 && "pl-4")}>
          {label && <span className="text-zinc-500 text-xs font-medium">{label}: </span>}
          <span className="text-zinc-600 italic text-xs">Empty list</span>
        </div>
      )
    }

    // Check if array contains only primitives
    const allPrimitives = data.every(item => 
      typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
    )

    if (allPrimitives) {
      return (
        <div className={cn("py-2", level > 0 && "pl-4")}>
          {label && <div className="text-zinc-500 text-xs font-bold uppercase mb-2">{label}:</div>}
          <ul className="space-y-1">
            {data.map((item, index) => (
              <li key={index} className="text-xs text-zinc-300 pl-3 border-l-2 border-indigo-500/30">
                {String(item)}
              </li>
            ))}
          </ul>
        </div>
      )
    }

    // Array of objects
    return (
      <div className={cn("py-2", level > 0 && "pl-4")}>
        {label && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold uppercase mb-2 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {label} ({data.length} items)
          </button>
        )}
        {isExpanded && (
          <div className="space-y-2 border-l-2 border-white/10 pl-3">
            {data.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-zinc-600 uppercase mb-2">Item {index + 1}</div>
                <SafeJsonDisplay data={item} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Handle objects
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    
    if (keys.length === 0) {
      return (
        <div className={cn("py-1", level > 0 && "pl-4")}>
          {label && <span className="text-zinc-500 text-xs font-medium">{label}: </span>}
          <span className="text-zinc-600 italic text-xs">Empty object</span>
        </div>
      )
    }

    return (
      <div className={cn("py-2", level > 0 && "pl-4")}>
        {label && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold uppercase mb-2 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {label}
          </button>
        )}
        {isExpanded && (
          <div className={cn(
            "space-y-1",
            level > 0 && "border-l-2 border-white/10 pl-3"
          )}>
            {keys.map((key) => (
              <SafeJsonDisplay 
                key={key}
                data={data[key]} 
                label={key}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Fallback for any other type
  return (
    <div className={cn("py-1", level > 0 && "pl-4")}>
      {label && <span className="text-zinc-500 text-xs font-medium">{label}: </span>}
      <span className="text-zinc-400 text-xs">{String(data)}</span>
    </div>
  )
}

/**
 * SafeJsonCard - کارت wrapper برای نمایش یک بخش کامل از JSON
 */
interface SafeJsonCardProps {
  title: string
  data: any
  icon?: React.ReactNode
  defaultExpanded?: boolean
}

export function SafeJsonCard({ title, data, icon, defaultExpanded = true }: SafeJsonCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (!data) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 text-zinc-500">
          {icon}
          <h3 className="text-sm font-bold uppercase">{title}</h3>
        </div>
        <p className="text-xs text-zinc-600 italic mt-2">No data available</p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-white uppercase">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-4">
          <SafeJsonDisplay data={data} level={0} defaultExpanded={true} />
        </div>
      )}
    </div>
  )
}
