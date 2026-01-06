'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploadProps {
  onAnalysisStart: () => void
  onAnalysisComplete: (result: any) => void
  onError: (error: string) => void
}

export default function FileUpload({
  onAnalysisStart,
  onAnalysisComplete,
  onError,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(selectedFile.type)) {
      onError('لطفاً فایل PDF یا تصویر (PNG, JPG) آپلود کنید')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      onError('حجم فایل نباید بیشتر از 10 مگابایت باشد')
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file) {
      onError('لطفاً یک فایل انتخاب کنید')
      return
    }

    onAnalysisStart()

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در تحلیل فایل')
      }

      const result = await response.json()
      onAnalysisComplete(result)
    } catch (error: any) {
      onError(error.message || 'خطا در ارسال فایل')
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
        />

        {!file ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary-100 rounded-full">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
            >
              کلیک کنید یا فایل را اینجا بکشید
            </label>
            <p className="text-gray-500 mt-2 text-sm">
              PDF یا تصویر (PNG, JPG) - حداکثر 10 مگابایت
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <FileText className="w-8 h-8 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} مگابایت
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
          >
            شروع تحلیل
          </button>
        </div>
      )}
    </div>
  )
}

