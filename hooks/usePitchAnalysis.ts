'use client'

import { useDashboard } from '@/contexts/DashboardContext'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useCredits } from './useCredits'

export function usePitchAnalysis() {
    const {
        setPhase,
        setIsLoading,
        setError,
        setDocumentContext,
        setTranscript,
        setAnalysisResult,
        contextData,
        documentContext
    } = useDashboard()
    const { user, organizationContext } = useAuth()
    const { checkCredits, useCredit, remainingCredits } = useCredits()

    const handleRecordingComplete = async (audioBlob: Blob | null, fileContext?: string) => {
        setIsLoading(true)
        setError(null)
        setPhase('analyzing')

        if (fileContext) {
            setDocumentContext(fileContext)
        }

        try {
            // بررسی موجودی credit قبل از شروع
            if (!user) throw new Error('You must be logged in')
            
            const hasEnough = await checkCredits('pitch_analysis')
            if (!hasEnough) {
                setError(`موجودی Credit کافی نیست. موجودی فعلی: ${remainingCredits} Credit`)
                setPhase('recording')
                setIsLoading(false)
                return
            }

            let text = ''

            // Get auth token
            const token = await user.getIdToken()

            // Only transcribe if we have audio (not for file-only mode)
            if (audioBlob && audioBlob.size > 0) {
                const formData = new FormData()
                formData.append('audio', audioBlob, 'recording.webm')

                // Create AbortController for transcription (10 minutes - generous timeout)
                const transcribeController = new AbortController()
                const transcribeTimeoutId = setTimeout(() => transcribeController.abort(), 600000) // 10 minutes

                const transcribeResponse = await fetch('/api/transcribe', { 
                    method: 'POST', 
                    body: formData,
                    signal: transcribeController.signal
                }).finally(() => {
                    clearTimeout(transcribeTimeoutId)
                })
                if (!transcribeResponse.ok) throw new Error('Transcription failed')
                let data;
                try {
                    data = await transcribeResponse.json()
                } catch (e) {
                    console.error("Transcription API returned non-JSON:", await transcribeResponse.text())
                    throw new Error("Transcribe API Error: Invalid JSON response")
                }
                text = data.text
                setTranscript(text)
            } else {
                setTranscript('')
            }

            const payload = {
                transcript: text,
                file_context: documentContext || fileContext, // Use closest context source
                ...contextData, // Spread collected context
                // Add organization context if user is a member
                organizationId: organizationContext?.membership?.organizationId,
                programId: organizationContext?.membership?.programIds?.[0], // Use first program if multiple
            }

            if (!payload.transcript && !payload.file_context) {
                throw new Error("No usable input found. Please record audio or upload a text-readable PDF.")
            }

            // Create AbortController for analysis (10 minutes - generous timeout)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minutes

            const analyzeResponse = await fetch('/api/analyze-pitch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            }).finally(() => {
                clearTimeout(timeoutId)
            })

            if (!analyzeResponse.ok) {
                let errData: any = {}
                let responseText = ''
                try {
                    responseText = await analyzeResponse.text()
                    errData = JSON.parse(responseText)
                } catch (e) {
                    // If response is not JSON, use status text
                    errData = { error: analyzeResponse.statusText || 'Analysis failed' }
                    responseText = analyzeResponse.statusText || 'No response text'
                }
                
                // Full logging for 504 errors
                if (analyzeResponse.status === 504) {
                    console.error('='.repeat(80))
                    console.error('[usePitchAnalysis] 504 TIMEOUT ERROR - CLIENT SIDE:')
                    console.error('='.repeat(80))
                    console.error('Response status:', analyzeResponse.status)
                    console.error('Response statusText:', analyzeResponse.statusText)
                    console.error('Response headers:', Object.fromEntries(analyzeResponse.headers.entries()))
                    console.error('Response body (text):', responseText)
                    console.error('Response body (parsed):', errData)
                    console.error('Request URL:', '/api/analyze-pitch')
                    console.error('Request method:', 'POST')
                    console.error('Payload size:', JSON.stringify(payload).length, 'chars')
                    console.error('Transcript length:', payload.transcript?.length || 0)
                    console.error('File context length:', payload.file_context?.length || 0)
                    console.error('='.repeat(80))
                    
                    setError('Analysis timed out. The content might be too long. Please try with shorter content.')
                    throw new Error('Analysis timed out')
                }
                
                if (analyzeResponse.status === 403 && errData.requiresUpgrade) {
                    setError(errData.error || "Please upgrade to Pro to continue.")
                    throw new Error(errData.error || "Upgrade required")
                }
                throw new Error(errData.error || 'Analysis failed')
            }

            let analysis;
            try {
                analysis = await analyzeResponse.json()
            } catch (e) {
                console.error("Analysis API returned non-JSON:", await analyzeResponse.text())
                throw new Error("Analysis API Error: Invalid JSON response")
            }
            setAnalysisResult(analysis)

            // Credit is already deducted on server-side in /api/analyze-pitch
            // No need to deduct again here

            // Save to pitchSubmissions collection (for organization tracking)
            if (user) {
                try {
                    const token = await user.getIdToken();
                    await fetch('/api/pitch-submissions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            transcript: text,
                            analysis: analysis,
                            organizationId: organizationContext?.membership?.organizationId,
                            programId: organizationContext?.membership?.programIds?.[0],
                            audioUrl: null, // Could be added later if we store audio
                            documentContext: documentContext || fileContext
                        })
                    });
                } catch (e) {
                    console.error("Error saving pitch submission:", e);
                    // Don't fail the whole flow if saving fails
                }
            }

            // Save History logic - support both analysis types
            const isPerfectPitch = analysis.stage1 && analysis.stage2 && analysis.stage3
            
            const sessionData = {
                name: `Session ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString(),
                score: isPerfectPitch 
                    ? (analysis.stage3?.final_readiness_scoring?.overall_readiness || analysis.stage3?.final_readiness_scoring?.readiness || 0)
                    : (analysis.overallScore || analysis.score || 0),
                summary: isPerfectPitch
                    ? `${analysis.stage1?.rawVerdict?.decision || 'Analysis'} - ${analysis.stage3?.investor_gate_verdict?.pass_human_review ? 'Pass' : 'Needs Work'}`
                    : analysis.summary,
                analysis: analysis,
                duration: '00:00',
                transcript: text || '',
                organizationId: organizationContext?.membership?.organizationId,
                programId: organizationContext?.membership?.programIds?.[0],
            }

            if (user) {
                try {
                    await addDoc(collection(db, `users/${user.uid}/sessions`), sessionData)
                } catch (e) {
                    console.error("Error saving to Firestore", e)
                }
            }

            setPhase('results')
        } catch (err: any) {
            // Full logging for timeout/abort errors
            if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('timed out')) {
                console.error('='.repeat(80))
                console.error('[usePitchAnalysis] TIMEOUT/ABORT ERROR - CLIENT SIDE:')
                console.error('='.repeat(80))
                console.error('Error name:', err.name)
                console.error('Error message:', err.message)
                console.error('Error stack:', err.stack)
                console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2))
                console.error('='.repeat(80))
                
                setError('Request timed out. Please try again with shorter content.')
            } else {
                console.error('[usePitchAnalysis] Error:', {
                    name: err.name,
                    message: err.message,
                    stack: err.stack
                })
                setError(err.message || 'An error occurred. Please try again.')
            }
            setPhase('recording')
        } finally {
            setIsLoading(false)
        }
    }

    return { handleRecordingComplete }
}
