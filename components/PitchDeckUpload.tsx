'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PitchDeckUploadProps {
  onFileProcessed: (extractedData: string) => void
  onError: (errorMessage: string) => void
}

export default function PitchDeckUpload({
  onFileProcessed,
  onError
}: PitchDeckUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [fileUrl])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setFileUrl(URL.createObjectURL(file))
    setIsProcessingFile(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse-doc', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errText = await response.text()
        let errMsg = 'Failed to parse document'
        try {
          const errJson = JSON.parse(errText)
          errMsg = errJson.error || errMsg
        } catch (_) {}
        throw new Error(errMsg)
      }

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const extractedDataStr = JSON.stringify(data.extractedData || {})
      onFileProcessed(extractedDataStr)
    } catch (err: any) {
      console.error('PDF parse error', err)
      onError(err.message || 'Failed to parse PDF')
      setUploadedFile(null)
      setFileUrl(null)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl)
      setFileUrl(null)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <AnimatePresence mode="wait">
          {!uploadedFile ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border border-dashed border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto group-hover:bg-zinc-800 transition-colors">
                <Upload className="w-5 h-5 text-zinc-500 group-hover:text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">Upload Pitch Deck</p>
                <p className="text-xs text-zinc-500 mt-1">PDF format only</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{uploadedFile.name}</p>
                <p className="text-xs text-zinc-500">
                  {isProcessingFile ? 'Processing...' : 'Ready for analysis'}
                </p>
              </div>
              {isProcessingFile ? (
                <Loader2 className="w-4 h-4 text-zinc-500 animate-spin shrink-0" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFile()
                  }}
                  className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {uploadedFile && isProcessingFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 text-zinc-400"
          >
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm">Analyzing your pitch deck...</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
