'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Mic, MicOff, PhoneOff, Briefcase, GraduationCap, Lightbulb, Zap, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AudioVisualizer } from '@/components/AudioVisualizer'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { RoleType } from './RoleSelector'

import { DeepAnalysisResult, ContextData } from '@/lib/types'

interface RealtimeConversationProps {
  analysisResult?: DeepAnalysisResult | null
  contextData?: ContextData
  pitchContext?: any // Keep for backward compatibility/fallback
  onEnd: () => void
  role?: RoleType
  documentContext?: string
}

export default function RealtimeConversation({
  analysisResult,
  contextData,
  pitchContext,
  onEnd,
  role = 'vc',
  documentContext
}: RealtimeConversationProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [vizStream, setVizStream] = useState<MediaStream | null>(null)

  // Cleanup function to ensure everything is closed strictly once
  const cleanupSession = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioElRef.current) {
      audioElRef.current.srcObject = null
      audioElRef.current = null
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let pc: RTCPeerConnection | null = null

    const startSession = async () => {
      try {
        if (!isMounted) return
        setStatus('connecting')
        setError(null)

        if (!user) throw new Error('Not authenticated')
        const token = await user.getIdToken()

        // Create AbortController for timeout handling (60 seconds)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 seconds

        const response = await fetch('/api/realtime/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            role: role,
            documentContext: documentContext,
            pitch_transcript: pitchContext?.transcript,

            // New Context Injection
            stage: contextData?.stage,
            industry: contextData?.industry,
            targetAudience: contextData?.targetAudience,

            // New Analysis Injection
            analysisSummary: analysisResult?.summary,
            risks: analysisResult?.risks,
            weaknesses: analysisResult?.weaknesses,

            prompt: { id: 'default' }
          }),
          signal: controller.signal
        }).finally(() => {
          clearTimeout(timeoutId)
        })

        if (!isMounted) return
        if (!response.ok) {
          let errText = ''
          let errData: any = {}
          try {
            errText = await response.text()
            try {
              errData = JSON.parse(errText)
            } catch {
              // Not JSON, use text
            }
          } catch (e) {
            errText = 'Failed to read error text'
          }
          
          // Full logging for 504 errors
          if (response.status === 504) {
            console.error('='.repeat(80))
            console.error('[RealtimeConversation] 504 TIMEOUT ERROR - CLIENT SIDE:')
            console.error('='.repeat(80))
            console.error('Response status:', response.status)
            console.error('Response statusText:', response.statusText)
            console.error('Response headers:', Object.fromEntries(response.headers.entries()))
            console.error('Response body (text):', errText)
            console.error('Response body (parsed):', errData)
            console.error('Request URL:', '/api/realtime/sessions')
            console.error('Request payload:', {
              role,
              hasDocumentContext: !!documentContext,
              hasTranscript: !!pitchContext?.transcript,
              hasContextData: !!contextData,
              hasAnalysisResult: !!analysisResult
            })
            console.error('='.repeat(80))
          }
          
          throw new Error(`Failed to start session: ${errText}`)
        }

        const sessionData = await response.json()
        const ephemeralKey = sessionData.client_secret.value

        if (!isMounted) return
        pc = new RTCPeerConnection()
        peerConnectionRef.current = pc

        const audioEl = document.createElement('audio')
        audioEl.autoplay = true
        audioElRef.current = audioEl

        pc.ontrack = (event) => {
          if (audioElRef.current) {
            audioElRef.current.srcObject = event.streams[0]
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (!isMounted) {
          // cleanup if unmounted during await
          stream.getTracks().forEach(t => t.stop())
          return
        }

        streamRef.current = stream
        setVizStream(stream)

        stream.getTracks().forEach(track => pc?.addTrack(track, stream))

        const dc = pc.createDataChannel("oai-events")
        dc.onopen = () => {
          const event = {
            type: "response.create",
            response: {
              modalities: ["audio", "text"],
              instructions: `Greet the founder. Start immediately. Say something like "Okay, I've reviewed your pitch..."`
            }
          }
          dc.send(JSON.stringify(event))
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-realtime-mini`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        })

        if (!isMounted) return
        if (!sdpResponse.ok) throw new Error('SDP exchange failed')

        const answerSdp = await sdpResponse.text()
        await pc.setRemoteDescription({
          type: 'answer',
          sdp: answerSdp,
        })

        if (isMounted) {
          setStatus('connected')
        }

      } catch (err: any) {
        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('504') || err.message?.includes('timed out')
        
        // Full logging for timeout errors
        if (isTimeout) {
          console.error('='.repeat(80))
          console.error('[RealtimeConversation] TIMEOUT ERROR - CLIENT SIDE:')
          console.error('='.repeat(80))
          console.error('Error name:', err.name)
          console.error('Error message:', err.message)
          console.error('Error stack:', err.stack)
          console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2))
          console.error('='.repeat(80))
        } else {
          console.error('[RealtimeConversation] Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack
          })
        }
        
        if (isMounted) {
          // Handle abort/timeout errors
          if (err.name === 'AbortError' || err.message?.includes('aborted')) {
            setError('Connection timed out. Please try again.')
          } else if (err.message?.includes('504') || err.message?.includes('timed out')) {
            setError('Session creation timed out. Please try again.')
          } else {
            setError(err.message || 'Connection failed')
          }
          setStatus('idle')
        }
        // Force cleanup on error
        cleanupSession()
      }
    }

    startSession()

    return () => {
      isMounted = false
      cleanupSession()
    }
  }, [role, pitchContext, documentContext, contextData, analysisResult, user, cleanupSession])

  const handleEndCall = () => {
    cleanupSession()
    onEnd()
  }

  // Visuals
  const getRoleTheme = () => {
    switch (role) {
      case 'founder_test': return 'from-amber-900 via-amber-950 to-black'
      case 'mentor': return 'from-emerald-900 via-emerald-950 to-black'
      case 'brainstorm': return 'from-violet-900 via-violet-950 to-black'
      case 'practice': return 'from-orange-900 via-orange-950 to-black'
      case 'vc': default: return 'from-zinc-900 via-zinc-950 to-black'
    }
  }

  const getRoleInfo = () => {
    switch (role) {
      case 'founder_test': return { title: 'Founder Test', icon: Crown, color: 'text-amber-400' }
      case 'mentor': return { title: 'Startup Mentor', icon: GraduationCap, color: 'text-emerald-400' }
      case 'brainstorm': return { title: 'Co-Founder', icon: Lightbulb, color: 'text-violet-400' }
      case 'practice': return { title: 'Practice Mode', icon: Zap, color: 'text-orange-400' }
      case 'vc': default: return { title: 'VC Partner', icon: Briefcase, color: 'text-white' }
    }
  }

  const { title, icon: Icon, color } = getRoleInfo()

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-4xl min-h-[500px]">

      {/* Top Status Bar */}
      <div className="flex items-center gap-3 mb-12 opacity-50">
        <div className={cn("w-2 h-2 rounded-full", status === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
        <span className="text-xs font-mono tracking-widest">{status === 'connected' ? 'LIVE CONNECTION ESTABLISHED' : 'ESTABLISHING SECURE CONNECTION...'}</span>
      </div>

      {/* Main Visualizer Area */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center mb-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-500/5 to-transparent rounded-full blur-3xl opacity-20" />

        {/* Center Persona Avatar - Minimal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10"
        >
          <div className="w-32 h-32 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl relative overflow-hidden">
            <Icon className={cn("w-10 h-10 opacity-50", color)} />
            {/* Overlay Visualizer */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay">
              <AudioVisualizer stream={vizStream} isActive={status === 'connected'} />
            </div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-lg font-medium text-white tracking-tight">{title}</h3>
            <p className="text-zinc-500 text-sm">AI Interviewer</p>
          </div>
        </motion.div>
      </div>

      {/* Minimal Controls */}
      <div className="flex items-center gap-6">


        <Button
          onClick={handleEndCall}
          className="h-12 px-6 rounded-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 transition-all text-sm font-medium tracking-wide"
        >
          End Session
        </Button>
      </div>
    </div>
  )
}
