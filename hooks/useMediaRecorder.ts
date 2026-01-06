import { useState, useRef, useCallback, useEffect } from 'react'

interface UseMediaRecorderProps {
    onRecordingComplete?: (blob: Blob) => void
    onError?: (error: string) => void
}

export function useMediaRecorder({ onRecordingComplete, onError }: UseMediaRecorderProps = {}) {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [mediaBlob, setMediaBlob] = useState<Blob | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const startRecording = useCallback((stream: MediaStream, mimeType = 'video/webm') => {
        try {
            const recorder = new MediaRecorder(stream, { mimeType })
            chunksRef.current = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType })
                setMediaBlob(blob)
                if (onRecordingComplete) onRecordingComplete(blob)
            }

            mediaRecorderRef.current = recorder
            recorder.start()
            setIsRecording(true)

            // Reset and start timer
            setRecordingTime(0)
            if (timerRef.current) clearInterval(timerRef.current)
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)

        } catch (err: any) {
            console.error("Failed to start recording:", err)
            const msg = err.message || "Failed to start recording"
            if (onError) onError(msg)
        }
    }, [onRecordingComplete, onError])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)
    }, [])

    const resetRecording = useCallback(() => {
        setMediaBlob(null)
        setRecordingTime(0)
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return {
        isRecording,
        recordingTime,
        mediaBlob,
        startRecording,
        stopRecording,
        resetRecording,
        formatTime
    }
}
