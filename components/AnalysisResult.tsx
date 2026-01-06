'use client'

import { RotateCcw, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'

interface AnalysisResultProps {
  result: {
    feedback: string
    questions: string[]
    strengths?: string[]
    weaknesses?: string[]
  }
  onReset: () => void
}

export default function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">نتایج تحلیل</h2>
        <button
          onClick={onReset}
          className="flex items-center space-x-2 space-x-reverse px-4 py-2 text-gray-600 hover:text-gray-900 transition"
        >
          <RotateCcw className="w-5 h-5" />
          <span>آپلود جدید</span>
        </button>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mr-3">بازخورد کلی</h3>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {result.feedback}
          </p>
        </div>
      </div>

      {/* Strengths */}
      {result.strengths && result.strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 ml-2" />
            <h3 className="text-xl font-bold text-green-900">نقاط قوت</h3>
          </div>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start text-green-800">
                <span className="ml-2">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {result.weaknesses && result.weaknesses.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-orange-600 ml-2" />
            <h3 className="text-xl font-bold text-orange-900">نقاط قابل بهبود</h3>
          </div>
          <ul className="space-y-2">
            {result.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start text-orange-800">
                <span className="ml-2">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mr-3">
            سوالات چالشی
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          این سوالات به شما کمک می‌کنند تا پیچ دک خود را بهبود دهید:
        </p>
        <div className="space-y-4">
          {result.questions.map((question, index) => (
            <div
              key={index}
              className="border-r-4 border-purple-500 bg-purple-50 rounded-lg p-5 hover:bg-purple-100 transition"
            >
              <p className="text-gray-800 font-medium leading-relaxed">
                {question}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

