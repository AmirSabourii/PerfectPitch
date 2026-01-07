'use client'

import { useDashboard } from '@/contexts/DashboardContext'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

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
    const { user } = useAuth()

    const handleRecordingComplete = async (audioBlob: Blob | null, fileContext?: string) => {
        setIsLoading(true)
        setError(null)
        setPhase('analyzing')

        if (fileContext) {
            setDocumentContext(fileContext)
        }

        try {
            let text = ''

            // Get auth token
            if (!user) throw new Error('You must be logged in')
            const token = await user.getIdToken()

            // Only transcribe if we have audio (not for file-only mode)
            if (audioBlob && audioBlob.size > 0) {
                const formData = new FormData()
                formData.append('audio', audioBlob, 'recording.webm')

                // Create AbortController for transcription timeout (5 minutes)
                const transcribeController = new AbortController()
                const transcribeTimeoutId = setTimeout(() => transcribeController.abort(), 300000) // 5 minutes

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
                ...contextData // Spread collected context
            }

            if (!payload.transcript && !payload.file_context) {
                throw new Error("No usable input found. Please record audio or upload a text-readable PDF.")
            }

            // Create AbortController for timeout handling (5 minutes)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes

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
                try {
                    errData = await analyzeResponse.json()
                } catch (e) {
                    // If response is not JSON, use status text
                    errData = { error: analyzeResponse.statusText || 'Analysis failed' }
                }
                if (analyzeResponse.status === 403 && errData.requiresUpgrade) {
                    setError(errData.error || "Please upgrade to Pro to continue.")
                    throw new Error(errData.error || "Upgrade required")
                }
                if (analyzeResponse.status === 504) {
                    setError('Analysis timed out. The content might be too long. Please try with shorter content.')
                    throw new Error('Analysis timed out')
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

            // Save History logic
            const sessionData = {
                name: `Session ${new Date().toLocaleDateString()}`,
                date: new Date().toISOString(),
                score: analysis.overallScore || analysis.score || 0,
                summary: analysis.summary,
                analysis: analysis,
                duration: '00:00'
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
            // Handle abort/timeout errors
            if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                setError('Request timed out. Please try again with shorter content.')
            } else {
                setError(err.message || 'An error occurred. Please try again.')
            }
            setPhase('recording')
        } finally {
            setIsLoading(false)
        }
    }

    return { handleRecordingComplete }
}
